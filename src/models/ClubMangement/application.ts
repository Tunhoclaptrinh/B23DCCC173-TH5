import { message } from 'antd';
import { useState } from 'react';
import { useModel } from 'umi';
import { generateUUID } from '@/services/ClassRoomManagement/classroom';

export default () => {
	const [applications, setApplications] = useState<ClubMangement.Application[]>([]);
	const [activityLogs, setActivityLogs] = useState<ClubMangement.Activity_logs[]>([]);
	const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
	const [selectedIds, setSelectedIds] = useState<string[]>([]); // Added for TableBase
	const [visibleForm, setVisibleForm] = useState<boolean>(false);
	const [record, setRecord] = useState<ClubMangement.Application | null>(null);
	const [isEdit, setEdit] = useState<boolean>(false);
	const [isView, setIsView] = useState<boolean>(false);
	const { data: clubs } = useModel('ClubMangement.club');

	// Added for TableBase compatibility
	const [page, setPage] = useState<number>(1);
	const [limit, setLimit] = useState<number>(10);
	const [total, setTotal] = useState<number>(0);
	const [filters, setFilters] = useState<any[]>([]);
	const [condition, setCondition] = useState<any>(undefined);
	const [sort, setSort] = useState<any>(undefined);
	const [loading, setLoading] = useState<boolean>(false);
	const initFilter: any[] = [];

	// Load applications data from localStorage or initialize with empty array
	const getApplicationsData = () => {
		setLoading(true);
		try {
			const localData = localStorage.getItem('applications');
			if (localData) {
				const parsedData = JSON.parse(localData);
				setApplications(parsedData);
				setTotal(parsedData.length);
			} else {
				localStorage.setItem('applications', JSON.stringify([]));
				setApplications([]);
				setTotal(0);
			}

			// Load activity logs
			const logsData = localStorage.getItem('activity_logs');
			if (logsData) {
				setActivityLogs(JSON.parse(logsData));
			} else {
				localStorage.setItem('activity_logs', JSON.stringify([]));
				setActivityLogs([]);
			}
		} catch (error) {
			console.error('Error loading data:', error);
			message.error('Failed to load application data');
		} finally {
			setLoading(false);
		}
	};

	// Added for TableBase compatibility
	const getModel = (params?: any) => {
		getApplicationsData();
	};

	// Add a new application
	const addApplication = (
		newApplication: Omit<ClubMangement.Application, '_id' | 'created_at' | 'updated_at' | 'status'>,
	) => {
		const timestamp = new Date().toISOString();
		const applicationWithId: ClubMangement.Application = {
			...newApplication,
			_id: generateUUID(),
			status: 'pending',
			created_at: timestamp,
			updated_at: timestamp,
		};

		const updatedApplications = [applicationWithId, ...applications];
		localStorage.setItem('applications', JSON.stringify(updatedApplications));
		setApplications(updatedApplications);
		setTotal(updatedApplications.length);
		message.success('Application submitted successfully!');
		return { success: true };
	};

	// Update an existing application
	const updateApplication = (id: string, updatedData: Partial<ClubMangement.Application>) => {
		const timestamp = new Date().toISOString();

		const updatedApplications = applications.map((app) =>
			app._id === id ? { ...app, ...updatedData, updated_at: timestamp } : app,
		);

		localStorage.setItem('applications', JSON.stringify(updatedApplications));
		setApplications(updatedApplications);
		message.success('Application updated successfully!');
		return { success: true };
	};

	// Delete an application
	const deleteApplication = (id: string) => {
		const updatedApplications = applications.filter((app) => app._id !== id);
		localStorage.setItem('applications', JSON.stringify(updatedApplications));
		setApplications(updatedApplications);
		setTotal(updatedApplications.length);
		message.success('Application deleted successfully!');
	};

	// Delete multiple applications (for TableBase compatibility)
	const deleteManyModel = async (ids: string[], callback?: () => void) => {
		const updatedApplications = applications.filter((app) => !ids.includes(app._id));
		localStorage.setItem('applications', JSON.stringify(updatedApplications));
		setApplications(updatedApplications);
		setTotal(updatedApplications.length);
		message.success(`${ids.length} applications deleted successfully!`);
		if (callback) callback();
		return { success: true };
	};

	// Log activity
	const logActivity = (
		applicationId: string,
		action: 'Approve' | 'Reject' | 'Move',
		reason: string,
		details: string = '',
	) => {
		const timestamp = new Date().toISOString();
		const newLog: ClubMangement.Activity_logs = {
			_id: generateUUID(),
			application_id: applicationId,
			admin_id: 'current-admin-id', // In a real app, this would come from auth context
			action: action,
			reason: reason,
			timestamp: timestamp,
			details: details,
		};

		const updatedLogs = [newLog, ...activityLogs];
		localStorage.setItem('activity_logs', JSON.stringify(updatedLogs));
		setActivityLogs(updatedLogs);
	};

	// Approve an application
	const approveApplication = (applicationId: string, notes: string = '') => {
		const application = applications.find((app) => app._id === applicationId);
		if (!application) {
			message.error('Application not found!');
			return { success: false, error: 'Application not found' };
		}

		// Update application status
		updateApplication(applicationId, { status: 'approved', notes });

		// Log the activity
		logActivity(applicationId, 'Approve', notes || 'Application approved');

		// Create a new member entry
		const newMember: ClubMangement.Member = {
			_id: generateUUID(),
			application_id: applicationId,
			club_id: application.desired_club_id,
			join_date: new Date().toISOString(),
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		// Save member to localStorage
		const existingMembers = JSON.parse(localStorage.getItem('members') || '[]');
		localStorage.setItem('members', JSON.stringify([...existingMembers, newMember]));

		return { success: true };
	};

	// Reject an application
	const rejectApplication = (applicationId: string, reason: string) => {
		if (!reason.trim()) {
			message.error('Rejection reason is required!');
			return { success: false, error: 'Rejection reason is required' };
		}

		// Update application status
		updateApplication(applicationId, { status: 'rejected', notes: reason });

		// Log the activity
		logActivity(applicationId, 'Reject', reason);

		return { success: true };
	};

	// Bulk approve applications
	const bulkApproveApplications = (applicationIds: string[], notes: string = '') => {
		applicationIds.forEach((id) => {
			approveApplication(id, notes);
		});
		setSelectedApplications([]);
		setSelectedIds([]);
		message.success(`${applicationIds.length} applications approved successfully!`);
	};

	// Bulk reject applications
	const bulkRejectApplications = (applicationIds: string[], reason: string) => {
		if (!reason.trim()) {
			message.error('Rejection reason is required!');
			return { success: false, error: 'Rejection reason is required' };
		}

		applicationIds.forEach((id) => {
			rejectApplication(id, reason);
		});
		setSelectedApplications([]);
		setSelectedIds([]);
		message.success(`${applicationIds.length} applications rejected successfully!`);
		return { success: true };
	};

	// Get application logs
	const getApplicationLogs = (applicationId: string) => {
		return activityLogs.filter((log) => log.application_id === applicationId);
	};

	// Get club name by id
	const getClubNameById = (clubId: string) => {
		const club = clubs?.find((c) => c._id === clubId);
		return club ? club.name : 'Unknown Club';
	};

	return {
		applications,
		activityLogs,
		selectedApplications,
		selectedIds,
		visibleForm,
		record,
		isEdit,
		isView,
		page,
		limit,
		total,
		filters,
		condition,
		sort,
		loading,
		initFilter,
		setSelectedApplications,
		setSelectedIds,
		setVisibleForm,
		setRecord,
		setEdit,
		setIsView,
		setPage,
		setLimit,
		setFilters,
		setCondition,
		setSort,
		getApplicationsData,
		getModel,
		addApplication,
		updateApplication,
		deleteApplication,
		deleteManyModel,
		approveApplication,
		rejectApplication,
		bulkApproveApplications,
		bulkRejectApplications,
		getApplicationLogs,
		getClubNameById,
		generateUUID, // Add this to expose the function
	};
};
