import React from 'react';
import {
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';

type ConfirmBookingRoute = RouteProp<RootStackParamList, 'ConfirmBooking'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type BookingDetails = {
	clinicName?: string;
	serviceName?: string;
	day?: string;
	date?: string;
	time?: string;
	additionalInfo?: string;
};

export default function ConfirmBookingScreen() {
	const navigation = useNavigation<NavigationProp>();
	const route = useRoute<ConfirmBookingRoute>();
	const { width } = useWindowDimensions();
	const details = (route.params as ConfirmBookingRoute['params'] & BookingDetails) || {};
	const isCompact = width < 700;

	const bookingRows = [
		['CLINIC', details.clinicName || 'Adriaanse Clinic'],
		['SERVICE', details.serviceName || 'General consultation'],
		['DAY', details.day || 'Monday'],
		['DATE', details.date || '11 May 2026'],
		['TIME', details.time || '12:00'],
	];

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={[styles.layout, isCompact && styles.layoutCompact]}>
				<LinearGradient
					colors={['#B08968', '#FFFFFF']}
					locations={[0, 0.72]}
					style={[styles.bookingPanel, isCompact && styles.panelCompact]}
				>
					<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
						<Ionicons name="arrow-back" size={19} color="#FFFFFF" />
					</TouchableOpacity>
					<Text style={styles.title}>Book an appointment</Text>
					<Text style={styles.stepText}>Step 4 of 4 - Confirmation</Text>

					<Text style={styles.sectionLabel}>CONFIRM BOOKING</Text>
					<View style={styles.detailsCard}>
						{bookingRows.map(([label, value]) => (
							<View style={styles.detailRow} key={label}>
								<Text style={styles.detailLabel}>{label}</Text>
								<Text style={[styles.detailValue, label === 'CLINIC' && styles.linkValue]}>
									{value}
								</Text>
							</View>
						))}
						<View style={styles.additionalInfo}>
							<Text style={styles.detailLabel}>ADDITIONAL INFO</Text>
							{!!details.additionalInfo && (
								<Text style={styles.additionalInfoValue}>{details.additionalInfo}</Text>
							)}
						</View>
					</View>

					<TouchableOpacity style={styles.confirmButton} onPress={() => navigation.navigate('PatientHome', {})}>
						<Text style={styles.confirmButtonText}>CONFIRM</Text>
					</TouchableOpacity>
				</LinearGradient>

				<View style={[styles.successPanel, isCompact && styles.successPanelCompact]}>
					<Text style={styles.successTitle}>SUCCESSFULLY BOOKED</Text>
					<MaterialCommunityIcons name="thumb-up" size={116} color="#789574" />
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	layout: {
		flex: 1,
		flexDirection: 'row',
	},
	layoutCompact: {
		flexDirection: 'column',
	},
	bookingPanel: {
		flex: 1,
		paddingHorizontal: 32,
		paddingTop: 36,
		paddingBottom: 18,
	},
	panelCompact: {
		minHeight: 560,
	},
	backButton: {
		width: 24,
		height: 24,
		borderWidth: 1,
		borderColor: '#FFFFFF',
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 2,
	},
	title: {
		color: '#FFFFFF',
		fontSize: 14,
		fontWeight: '700',
		marginTop: -21,
		marginLeft: 27,
	},
	stepText: {
		color: '#111111',
		fontSize: 9,
		marginLeft: 27,
		marginTop: 1,
	},
	sectionLabel: {
		color: '#111111',
		fontSize: 8,
		fontWeight: '700',
		marginTop: 66,
		marginBottom: 6,
	},
	detailsCard: {
		backgroundColor: '#FFFFFF',
		borderColor: '#C6C6C6',
		borderWidth: 2,
		borderRadius: 8,
		minHeight: 264,
		paddingHorizontal: 14,
		paddingTop: 23,
		shadowColor: '#000000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.08,
		shadowRadius: 2,
		elevation: 2,
	},
	detailRow: {
		minHeight: 34,
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
	},
	detailLabel: {
		color: '#111111',
		fontSize: 8,
		fontWeight: '700',
	},
	detailValue: {
		color: '#111111',
		fontSize: 8,
		textAlign: 'right',
		maxWidth: '64%',
	},
	linkValue: {
		textDecorationLine: 'underline',
	},
	additionalInfo: {
		marginTop: 2,
	},
	additionalInfoValue: {
		color: '#555555',
		fontSize: 8,
		marginTop: 8,
	},
	confirmButton: {
		height: 25,
		backgroundColor: '#3F4B6B',
		borderColor: '#1D2437',
		borderWidth: 1,
		borderRadius: 6,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 'auto',
	},
	confirmButtonText: {
		color: '#FFFFFF',
		fontSize: 10,
		fontWeight: '800',
	},
	successPanel: {
		flex: 1,
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		paddingTop: 82,
	},
	successPanelCompact: {
		minHeight: 300,
		paddingTop: 62,
	},
	successTitle: {
		color: '#111111',
		fontSize: 11,
		fontWeight: '900',
		marginBottom: 120,
	},
});
