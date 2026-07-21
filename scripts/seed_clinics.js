// scripts/seed_clinics.js
// Run with: node scripts/seed_clinics.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Real clinic data from City of Cape Town
const clinics = [
  // Clinics
  { clinicName: 'Adriaanse Clinic', address: '40th Avenue, Clarke Estate', phone: '021 444 2396/7', facilityType: 'Clinic' },
  { clinicName: 'Albow Gardens Clinic', address: 'Koeberg Road, Milnerton', phone: '021 444 5943', facilityType: 'Clinic' },
  { clinicName: 'Alphen Clinic', address: 'Alphen Centre, Main Rd, Constantia', phone: '021 444 9628', facilityType: 'Clinic' },
  { clinicName: 'Bloekombos Clinic', address: 'Sam Nokasela Ave, Kraaifontein', phone: '021 444 1092', facilityType: 'Clinic' },
  { clinicName: 'Blue Downs Clinic', address: 'Bentley Road, Blue Downs', phone: '021 444 8313', facilityType: 'Clinic' },
  { clinicName: 'Brackenfell Clinic', address: 'Paradys Street, Brackenfell', phone: '021 400 3889', facilityType: 'Clinic' },
  { clinicName: 'Brighton Clinic', address: 'Brighton Street, Kraaifontein', phone: '021 444 1127', facilityType: 'Clinic' },
  { clinicName: 'Chapel Street Clinic', address: 'Chapel Street, Woodstock', phone: '021 814 1540/50', facilityType: 'Clinic' },
  { clinicName: 'Claremont Clinic', address: 'Old Stanhope Road, Claremont', phone: '021 444 6426/27', facilityType: 'Clinic' },
  { clinicName: 'Crossroads 1 Clinic', address: 'Klipfontein Road, Crossroads', phone: '021 444 6440/35/6', facilityType: 'Clinic' },
  { clinicName: 'Delft South Clinic', address: 'Cnr Boyce St and Delft Main Rd, Delft', phone: '021 444 8974/5/98', facilityType: 'Clinic' },
  { clinicName: 'Diep River Clinic', address: 'Schaay Road, Diep River', phone: '021 400 4379/83', facilityType: 'Clinic' },
  { clinicName: 'Eastridge Clinic', address: '1st Avenue, Eastridge', phone: '021 444 6379/80', facilityType: 'Clinic' },
  { clinicName: 'Eerste River Clinic', address: "Bob's Way, Eerste River", phone: '021 444 7144', facilityType: 'Clinic' },
  { clinicName: 'Elsies River Clinic', address: '26th Avenue, Elsies River', phone: '021 444 3900/01/02', facilityType: 'Clinic' },
  { clinicName: 'Fagan Street Clinic', address: 'Fagan Street, Strand', phone: '021 400 4296', facilityType: 'Clinic' },
  { clinicName: 'Fish Hoek Clinic', address: 'Central Circle, Fish Hoek', phone: '021 814 1800', facilityType: 'Clinic' },
  { clinicName: 'Gugulethu Clinic', address: 'Cnr NY1 and NY3, Gugulethu', phone: '021 444 6059/67', facilityType: 'Clinic' },
  { clinicName: 'Hanover Park Clinic', address: 'Hanover Park Avenue, Hanover Park', phone: '021 444 1405/11', facilityType: 'Clinic' },
  { clinicName: 'Harmonie Clinic', address: 'Frans Conradie Drive, Kraaifontein', phone: '021 444 0558', facilityType: 'Clinic' },
  { clinicName: 'Hout Bay Clinic', address: 'Main Road, Hout Bay', phone: '081 814 1856/1860', facilityType: 'Clinic' },
  { clinicName: 'Klip Road Clinic', address: 'Klip Road, Grassy Park', phone: '021 444 4296/4', facilityType: 'Clinic' },
  { clinicName: 'Kuilsriver Clinic', address: 'Carinus Street, Kuils River', phone: '021 444 7730/31', facilityType: 'Clinic' },
  { clinicName: 'Kuyasa Male Clinic', address: 'Walter Sisulu Rd, Kuyasa, Khayelitsha', phone: '021 444 2861', facilityType: 'Clinic' },
  { clinicName: 'Langa Clinic', address: 'King Langalibalele Street, Langa', phone: '021 444 8338/83/8370', facilityType: 'Clinic' },
  { clinicName: 'Lansdowne Clinic', address: 'Cnr Lansdowne Rd and Church St, Lansdowne', phone: '021 444 4286/7', facilityType: 'Clinic' },
  { clinicName: 'Lavender Hill Clinic', address: 'Grindle Crescent, Lavender Hill', phone: '021 814 1660/58', facilityType: 'Clinic' },
  { clinicName: 'Lentegeur Clinic', address: 'Cnr Merrydale and Melkbos Rds, Lentegeur', phone: '021 444 1428/9', facilityType: 'Clinic' },
  { clinicName: 'Maitland Clinic', address: 'Norfolk Road, Maitland', phone: '021 400 4333/4341', facilityType: 'Clinic' },
  { clinicName: 'Manenberg Clinic', address: 'Manenberg Avenue, Manenberg', phone: '021 444 1259', facilityType: 'Clinic' },
  { clinicName: 'Masincedane Clinic', address: 'Mjodo Street, KTC, Nyanga', phone: '021 444 6462/63/64', facilityType: 'Clinic' },
  { clinicName: 'Masiphumelele Clinic', address: 'Pokela Road, Masiphumelele', phone: '021 444 4103', facilityType: 'Clinic' },
  { clinicName: 'Mayenzeke Clinic', address: 'Fundana Road, Makhaza, Khayelitsha', phone: '021 444 3479/87', facilityType: 'Clinic' },
  { clinicName: 'Melkbosstrand Clinic', address: 'Robben Road, Melkbosstrand', phone: '021 814 1767/68', facilityType: 'Clinic' },
  { clinicName: 'Muizenberg Clinic', address: '6 Atlantic Road, Muizenberg', phone: '021 444 3914/13', facilityType: 'Clinic' },
  { clinicName: 'Mzamomhle Clinic', address: 'Sagwityi Road, Browns Farm, Philippi', phone: '021 444 6096/7', facilityType: 'Clinic' },
  { clinicName: 'Netreg Clinic', address: 'Cnr Jakkalsvlei & Bonteheuwel Aves, Netreg', phone: '021 444 4321/19', facilityType: 'Clinic' },
  { clinicName: 'Northpine Clinic', address: 'Northpine Drive, Brackenfell', phone: '021 444 7730', facilityType: 'Clinic' },
  { clinicName: 'Parkwood Clinic', address: 'Walmer Road, Parkwood Estate', phone: '021 444 4201/11', facilityType: 'Clinic' },
  { clinicName: 'Philippi Clinic', address: 'Cnr Lansdowne & Ottery Rds, Philippi', phone: '021 400 4030/38', facilityType: 'Clinic' },
  { clinicName: 'Phumlani Clinic', address: 'Stock and Mgqwani Rds, Philippi East', phone: '021 444 6147/8', facilityType: 'Clinic' },
  { clinicName: 'Rocklands Clinic', address: 'Cnr Lancaster Rd & Park Ave, Rocklands', phone: '021 400 3976', facilityType: 'Clinic' },
  { clinicName: 'Sarepta Clinic', address: 'Rietvlei Road, Sarepta', phone: '021 900 2915/2910', facilityType: 'Clinic' },
  { clinicName: 'Seawinds Clinic', address: '10 Military Road Extension, Seawinds', phone: '021 444 8785/84', facilityType: 'Clinic' },
  { clinicName: 'Silvertown Clinic', address: 'Petunia Street, Silvertown', phone: '021 444 6339/38', facilityType: 'Clinic' },
  { clinicName: 'Site B Male Clinic', address: 'Cnr Bunga and Sulani Drive, Khayelitsha', phone: '021 400 3420', facilityType: 'Clinic' },
  { clinicName: 'Site B Youth Clinic', address: 'Cnr Pama & Lwandle Rds, Site B, Khayelitsha', phone: '021 444 2809/10', facilityType: 'Clinic' },
  { clinicName: 'Site C Youth Clinic', address: 'Solomon Tshuku Rd, Site C', phone: '021 444 6545', facilityType: 'Clinic' },
  { clinicName: 'Spencer Road Clinic', address: '13 Spencer Road, Salt River', phone: '021 444 6215/6', facilityType: 'Clinic' },
  { clinicName: 'Strandfontein Clinic', address: 'Welgelegen Road, Strandfontein', phone: '021 814 1024/6/1019', facilityType: 'Clinic' },
  { clinicName: 'Table View Clinic', address: 'South Road, Table View', phone: '021 444 5970/71', facilityType: 'Clinic' },
  { clinicName: 'Uitsig Clinic', address: 'Hibiscus Square, Uitsig', phone: '021 444 8528/29', facilityType: 'Clinic' },
  { clinicName: 'Valhalla Park Clinic', address: 'Angela Street, Valhalla Park', phone: '021 444 4306/5/16', facilityType: 'Clinic' },
  { clinicName: 'Vuyani Clinic', address: 'NY133, Gugulethu', phone: '021 444 6090/78/79', facilityType: 'Clinic' },
  { clinicName: 'Wallacedene Clinic', address: 'Cnr La Boheme and Pietersen St, Wallacedene', phone: '021 444 0709', facilityType: 'Clinic' },
  { clinicName: 'Weltevreden Valley Clinic', address: 'Cnr Oliver Tambo and Leonard Rds, Samora Machel', phone: '021 444 6502/3', facilityType: 'Clinic' },
  { clinicName: 'Wesbank Clinic', address: 'Silversands Road, Wesbank', phone: '021 400 5271', facilityType: 'Clinic' },
  { clinicName: 'Westlake Clinic', address: '44 Westlake Drive, Westlake', phone: '021 814 1607/01', facilityType: 'Clinic' },
  { clinicName: 'Westridge Clinic', address: 'Cnr Wespoort Dr & De Duin Rd, Westridge', phone: '021 400 4112/3', facilityType: 'Clinic' },
  { clinicName: 'Wynberg Clinic', address: 'Lower Maynard Rd, Wynberg', phone: '021 444 6613/14', facilityType: 'Clinic' },
  { clinicName: 'Zakhele Clinic', address: 'A544 Zakhele Road, Khayelitsha', phone: '021 444 5505/4', facilityType: 'Clinic' },
  
  // Community Day Centres (CDCs)
  { clinicName: 'Albow Gardens Community Day Centre', address: '2 Albow Road, Milnerton', phone: '021 444 5949/50', facilityType: 'CDC' },
  { clinicName: 'Dr Ivan Toms Community Day Centre', address: 'Cnr Ngubelani and Umabashe St, Ext 6, Mfuleni', phone: '021 400 3600', facilityType: 'CDC' },
  { clinicName: "Gordon's Bay Community Day Centre", address: 'Cnr Mountainside Blvd and Sir Lowry\'s Pass Rd, Gordons Bay', phone: '021 444 3919', facilityType: 'CDC' },
  { clinicName: 'Ikhwezi Community Day Centre', address: '3 Simon Street, Nomzamo', phone: '021 444 4748', facilityType: 'CDC' },
  { clinicName: 'Kuyasa Community Day Centre', address: 'Ntazane Road, Kuyasa, Khayelitsha', phone: '021 444 2803/50', facilityType: 'CDC' },
  { clinicName: 'Luvuyo Community Day Centre', address: 'Hlela Road, Makhaza, Khayelitsha', phone: '021 444 0530/1', facilityType: 'CDC' },
  { clinicName: 'Matthew Goniwe Community Day Centre', address: 'Kwahlaza Road, Makhaza, Khayelitsha', phone: '021 444 2868/2918', facilityType: 'CDC' },
  { clinicName: 'Ocean View Community Day Centre', address: 'Cnr Carina and Pollux Way, Ocean View', phone: '021 400 5474/0309', facilityType: 'CDC' },
  { clinicName: 'Pelican Park Community Day Centre', address: 'Cnr Oystercatcher and Babbler Rds, Pelican Park', phone: '021 814 1219/22', facilityType: 'CDC' },
  { clinicName: "Sir Lowry's Pass Community Day Centre", address: 'Cnr Nolan and Brinkhuis St, Sir Lowry\'s Pass', phone: '021 444 1173', facilityType: 'CDC' },
  { clinicName: 'Somerset West Community Day Centre', address: '28 Church Street, Somerset West', phone: '021 444 4452', facilityType: 'CDC' },
  { clinicName: 'St Vincent Community Day Centre', address: 'St Vincent Drive, Belhar', phone: '021 444 6257/8/9/60', facilityType: 'CDC' },
  { clinicName: 'Tafelsig Community Day Centre', address: 'Cnr Kilimanjaro and Pyraneez Rds, Tafelsig', phone: '021 444 2024/5', facilityType: 'CDC' },
  { clinicName: 'Town 2 Community Day Centre', address: 'Cnr Japtha Masemola & Basil Zondi Rds, Khayelitsha', phone: '021 444 2529/2838', facilityType: 'CDC' },
];

async function seedClinics() {
  console.log(`Seeding ${clinics.length} clinics...`);
  
  let successCount = 0;
  let errorCount = 0;

  for (const clinic of clinics) {
    try {
      const { error } = await supabase
        .from('clinics')
        .upsert({
          clinicName: clinic.clinicName,
          address: clinic.address,
          phone: clinic.phone,
          facilityType: clinic.facilityType,
          status: 'active',
          operatingHours: 'Monday to Friday: 07:30 - 16:30',
          contactDetails: clinic.phone,
        }, { onConflict: 'clinicName' });

      if (error) {
        console.error(`Error upserting ${clinic.clinicName}:`, error);
        errorCount++;
      } else {
        console.log(`✓ ${clinic.clinicName}`);
        successCount++;
      }
    } catch (err) {
      console.error(`Failed to upsert ${clinic.clinicName}:`, err);
      errorCount++;
    }
  }

  console.log(`\n✅ Seeding complete: ${successCount} clinics upserted, ${errorCount} errors`);
}

seedClinics().catch(console.error);