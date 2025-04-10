import React, { useEffect, useState } from 'react';
import TableBase from '@/components/Table';
import { IColumn } from '@/components/Table/typing';
import { useModel } from 'umi';
import { Button, Tag, Space, Modal, Input, Typography, List, Timeline } from 'antd';
import {
	EditOutlined,
	EyeOutlined,
	DeleteOutlined,
	CheckOutlined,
	CloseOutlined,
	HistoryOutlined,
} from '@ant-design/icons';
import ApplicationForm from '../../../components/ClubMangaement/applicationForm';

const { TextArea } = Input;
const { Text } = Typography;

const ApplicationManagement = () => {
	const model = useModel('ClubMangement.application');
	const clubModel = useModel('ClubMangement.club');
	const [rejectModalVisible, setRejectModalVisible] = useState(false);
	const [bulkRejectModalVisible, setBulkRejectModalVisible] = useState(false);
	const [rejectionReason, setRejectionReason] = useState('');
	const [currentApplicationId, setCurrentApplicationId] = useState('');
	const [logsModalVisible, setLogsModalVisible] = useState(false);
	const [currentLogs, setCurrentLogs] = useState<ClubMangement.Activity_logs[]>([]);

	// Load data on component mount
	useEffect(() => {
		model.getApplicationsData();
		clubModel.getModel && clubModel.getModel(); // Safely check if getModel exists
	}, []);

	// Handle form submission
	const handleFormSubmit = (values: any) => {
		if (model.isEdit) {
			// Update existing application
			const result = model.updateApplication(model.record?._id || '', values);
			if (result.success) {
				model.setVisibleForm(false);
			}
		} else {
			// Add new application
			const result = model.addApplication(values);
			if (result.success) {
				model.setVisibleForm(false);
			}
		}
	};

	// Handle application approval
	const handleApprove = (id: string) => {
		model.approveApplication(id);
	};

	// Open rejection modal
	const showRejectModal = (id: string) => {
		setCurrentApplicationId(id);
		setRejectionReason('');
		setRejectModalVisible(true);
	};

	// Handle application rejection
	const handleReject = () => {
		const result = model.rejectApplication(currentApplicationId, rejectionReason);
		if (result.success) {
			setRejectModalVisible(false);
		}
	};

	// Handle bulk approval
	const handleBulkApprove = () => {
		model.bulkApproveApplications(model.selectedApplications);
	};

	// Open bulk rejection modal
	const showBulkRejectModal = () => {
		setRejectionReason('');
		setBulkRejectModalVisible(true);
	};

	// Handle bulk rejection
	const handleBulkReject = () => {
		const result = model.bulkRejectApplications(model.selectedApplications, rejectionReason);
		if (result.success) {
			setBulkRejectModalVisible(false);
		}
	};

	// Show activity logs
	const showActivityLogs = (applicationId: string) => {
		const logs = model.getApplicationLogs(applicationId);
		setCurrentLogs(logs);
		setLogsModalVisible(true);
	};

	// Define table columns
	const columns: IColumn<ClubMangement.Application>[] = [
		{
			title: 'Full Name',
			dataIndex: 'full_name',
			width: 150,
			sortable: true,
			filterType: 'string',
		},
		{
			title: 'Email',
			dataIndex: 'email',
			width: 180,
			sortable: true,
			filterType: 'string',
		},
		{
			title: 'Phone Number',
			dataIndex: 'phone_number',
			width: 120,
			filterType: 'string',
		},
		{
			title: 'Gender',
			dataIndex: 'gender',
			width: 100,
			filterType: 'select',
			filters: [
				{ text: 'Nam', value: 'Nam' },
				{ text: 'Nữ', value: 'Nữ' },
				{ text: 'Khác', value: 'Khác' },
			],
		},
		{
			title: 'Desired Club',
			dataIndex: 'desired_club_id',
			width: 150,
			render: (clubId: string) => model.getClubNameById(clubId),
			filterType: 'select',
			filters: clubModel.data?.map((club) => ({ text: club.name, value: club._id })) || [],
		},
		{
			title: 'Status',
			dataIndex: 'status',
			width: 120,
			render: (status: string) => {
				let color = 'blue';
				if (status === 'approved') color = 'green';
				if (status === 'rejected') color = 'red';
				return <Tag color={color}>{status.toUpperCase()}</Tag>;
			},
			filterType: 'select',
			filters: [
				{ text: 'Pending', value: 'pending' },
				{ text: 'Approved', value: 'approved' },
				{ text: 'Rejected', value: 'rejected' },
			],
		},
		{
			title: 'Apply Date',
			dataIndex: 'created_at',
			width: 150,
			sortable: true,
			render: (text: string) => {
				const date = new Date(text);
				return date.toLocaleDateString('vi-VN');
			},
		},
		{
			title: 'Actions',
			width: 250,
			align: 'center',
			render: (_, record) => (
				<Space size='small'>
					<Button
						type='text'
						icon={<EyeOutlined />}
						onClick={() => {
							model.setRecord(record);
							model.setIsView(true);
							model.setEdit(false);
							model.setVisibleForm(true);
						}}
						title='View Details'
					/>
					<Button
						type='text'
						icon={<EditOutlined />}
						onClick={() => {
							model.setRecord(record);
							model.setEdit(true);
							model.setIsView(false);
							model.setVisibleForm(true);
						}}
						title='Edit'
						disabled={record.status !== 'pending'}
					/>
					<Button
						type='text'
						danger
						icon={<DeleteOutlined />}
						onClick={() => model.deleteApplication(record._id)}
						title='Delete'
					/>
					<Button
						type='text'
						style={{ color: 'green' }}
						icon={<CheckOutlined />}
						onClick={() => handleApprove(record._id)}
						title='Approve'
						disabled={record.status !== 'pending'}
					/>
					<Button
						type='text'
						danger
						icon={<CloseOutlined />}
						onClick={() => showRejectModal(record._id)}
						title='Reject'
						disabled={record.status !== 'pending'}
					/>
					<Button
						type='text'
						icon={<HistoryOutlined />}
						onClick={() => showActivityLogs(record._id)}
						title='Activity Logs'
					/>
				</Space>
			),
		},
	];

	// Render bulk action buttons based on selection
	const renderBulkActionButtons = () => {
		if (model.selectedApplications.length === 0) return null;

		return (
			<Space style={{ marginBottom: 16 }}>
				<Button type='primary' onClick={handleBulkApprove}>
					Approve {model.selectedApplications.length} selected applications
				</Button>
				<Button danger onClick={showBulkRejectModal}>
					Reject {model.selectedApplications.length} selected applications
				</Button>
			</Space>
		);
	};

	return (
		<>
			{renderBulkActionButtons()}

			<TableBase
				title='Membership Applications'
				columns={columns}
				modelName='ClubMangement.application'
				deleteMany={true}
				rowSelection={true}
				getData={model.getApplicationsData} // Pass explicit getData function
				Form={(props) => (
					<ApplicationForm
						onFinish={function (values: any): void {
							throw new Error('Function not implemented.');
						}}
						onCancel={function (): void {
							throw new Error('Function not implemented.');
						}}
						{...props}
						title={model.isEdit ? 'Edit Application' : model.isView ? 'Application Details' : 'New Application'}
						clubs={clubModel.data || []}
					/>
				)}
				dataState='applications'
				formProps={{
					onFinish: handleFormSubmit,
					onCancel: () => model.setVisibleForm(false),
					record: model.record,
					isEdit: model.isEdit,
					isView: model.isView,
				}}
				formType='Modal'
				widthDrawer={700}
			/>

			{/* Rejection Modal */}
			<Modal
				title='Reject Application'
				visible={rejectModalVisible}
				onOk={handleReject}
				onCancel={() => setRejectModalVisible(false)}
				okText='Reject'
				okButtonProps={{ danger: true }}
			>
				<p>Please provide a reason for rejecting this application:</p>
				<TextArea
					rows={4}
					value={rejectionReason}
					onChange={(e) => setRejectionReason(e.target.value)}
					placeholder='Enter rejection reason'
				/>
			</Modal>

			{/* Bulk Rejection Modal */}
			<Modal
				title={`Reject ${model.selectedApplications.length} Applications`}
				visible={bulkRejectModalVisible}
				onOk={handleBulkReject}
				onCancel={() => setBulkRejectModalVisible(false)}
				okText='Reject All'
				okButtonProps={{ danger: true }}
			>
				<p>Please provide a reason for rejecting these applications:</p>
				<TextArea
					rows={4}
					value={rejectionReason}
					onChange={(e) => setRejectionReason(e.target.value)}
					placeholder='Enter rejection reason'
				/>
			</Modal>

			{/* Activity Logs Modal */}
			<Modal
				title='Application Activity History'
				visible={logsModalVisible}
				onCancel={() => setLogsModalVisible(false)}
				footer={[
					<Button key='close' onClick={() => setLogsModalVisible(false)}>
						Close
					</Button>,
				]}
				width={600}
			>
				{currentLogs.length === 0 ? (
					<Text>No activity logs found for this application.</Text>
				) : (
					<Timeline>
						{currentLogs.map((log) => (
							<Timeline.Item key={log._id} color={log.action === 'Approve' ? 'green' : 'red'}>
								<Text strong>{log.action}</Text> at {new Date(log.timestamp).toLocaleString()}
								<br />
								<Text>Reason: {log.reason}</Text>
								{log.details && (
									<Text italic>
										<br />
										Details: {log.details}
									</Text>
								)}
							</Timeline.Item>
						))}
					</Timeline>
				)}
			</Modal>
		</>
	);
};

export default ApplicationManagement;
