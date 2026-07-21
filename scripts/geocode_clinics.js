// scripts/geocode_clinics.js
// Run with: node scripts/geocode_clinics.js

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function geocode(address) {
  const query = `${address}, Cape Town, South Africa`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ClinicConnect/1.0 (clinicconnect@example.com)',
    },
  });

  if (!response.ok) throw new Error(`Nominatim HTTP ${response.status}`);
  const results = await response.json();
  if (!results.length) return null;

  return {
    lat: parseFloat(results[0].lat),
    lng: parseFloat(results[0].lon),
  };
}

async function geocodeClinics() {
  // Get clinics without coordinates
  const { data: clinics, error } = await supabase
    .from('clinics')
    .select('id, clinicName, address')
    .is('latitude', null)
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching clinics:', error);
    return;
  }

  console.log(`Found ${clinics.length} clinics to geocode...`);

  let successCount = 0;
  let errorCount = 0;

  for (const clinic of clinics) {
    try {
      console.log(`Geocoding: ${clinic.clinicName}...`);
      const coords = await geocode(clinic.address);
      
      if (coords) {
        const { error: updateError } = await supabase
          .from('clinics')
          .update({
            latitude: coords.lat,
            longitude: coords.lng,
          })
          .eq('id', clinic.id);

        if (updateError) {
          console.error(`Error updating ${clinic.clinicName}:`, updateError);
          errorCount++;
        } else {
          console.log(`✓ ${clinic.clinicName} -> ${coords.lat}, ${coords.lng}`);
          successCount++;
        }
      } else {
        console.log(`✗ No coordinates found for ${clinic.clinicName}`);
        errorCount++;
      }

      // Wait 1.1 seconds (Nominatim rate limit)
      await new Promise(resolve => setTimeout(resolve, 1100));
    } catch (err) {
      console.error(`Error geocoding ${clinic.clinicName}:`, err.message);
      errorCount++;
    }
  }

  console.log(`\n✅ Geocoding complete: ${successCount} clinics updated, ${errorCount} errors`);
}

geocodeClinics().catch(console.error);