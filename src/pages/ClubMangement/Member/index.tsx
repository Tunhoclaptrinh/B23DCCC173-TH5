// src/pages/ClubManagement/MemberManagement/index.tsx
import React, { useEffect, useState } from 'react';
import TableBase from '@/components/Table';
import { IColumn } from '@/components/Table/typing';
import { useModel } from 'umi';
import { Button, Tag, Space, Modal, Select, message, Typography, Tooltip } from 'antd';
import {
	EditOutlined,
	EyeOutlined,
	DeleteOutlined,
	SwapOutlined,
	UserSwitchOutlined,
	HistoryOutlined,
	FilterOutlined,
} from '@ant-design/icons';
import ApplicationForm from '../../../components/ClubMangaement/applicationForm';

const { Text } = Typography;

const MemberManagement = () => {
	const applicationModel = useModel('ClubMangement.application');
	const clubModel = useModel('ClubMangement.club');
	const [moveModalVisible, setMoveModalVisible] = useState(false);
	const [historyModalVisible, setHistoryModalVisible] = useState(false);
	const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
	const [targetClubId, setTargetClubId] = useState<string>('');
	const [members, setMembers] = useState<any[]>([]);
	const [filteredClubId, setFilteredClubId] = useState<string | null>(null);
	const [currentMemberLogs, setCurrentMemberLogs] = useState<ClubMangement.Activity_logs[]>([]);
	const [currentMemberId, setCurrentMemberId] = useState<string>('');

	// Load data on component mount
	useEffect(() => {
		loadMembers();
		clubModel.getModel && clubModel.getModel();
	}, [filteredClubId]);

	// Load members from localStorage
	const loadMembers = () => {
		try {
			// Get all members
			const localMembers = localStorage.getItem('members');
			const membersData = localMembers ? JSON.parse(localMembers) : [];

			// Get all applications
			const localApplications = localStorage.getItem('applications');
			const applicationsData = localApplications ? JSON.parse(localApplications) : [];

			// Combine the data to get full member information
			let combinedMembers = membersData.map((member: ClubMangement.Member) => {
				const application = applicationsData.find(
					(app: ClubMangement.Application) => app._id === member.application_id,
				);
				const club = clubModel.data?.find((c) => c._id === member.club_id);

				return {
					...member,
					...application,
					club_name: club?.name || 'Unknown Club',
				};
			});

			// Apply club filter if active
			if (filteredClubId) {
				combinedMembers = combinedMembers.filter((member: { club_id: string }) => member.club_id === filteredClubId);
			}

			setMembers(combinedMembers);
		} catch (error) {
			console.error('Error loading members:', error);
			message.error('Failed to load members data');
		}
	};

	// Handle moving members to a different club
	const handleMoveMembers = () => {
		if (!targetClubId) {
			message.error('Please select a destination club');
			return;
		}

		try {
			// Get current members
			const localMembers = localStorage.getItem('members');
			const membersData = localMembers ? JSON.parse(localMembers) : [];

			// Update club_id for selected members
			const updatedMembers = membersData.map((member: ClubMangement.Member) => {
				if (selectedMemberIds.includes(member._id)) {
					// Log this activity
					logMemberMove(member, targetClubId);

					return {
						...member,
						club_id: targetClubId,
						updated_at: new Date().toISOString(),
					};
				}
				return member;
			});

			// Save updated members
			localStorage.setItem('members', JSON.stringify(updatedMembers));

			message.success(`Successfully moved ${selectedMemberIds.length} member(s) to ${getClubNameById(targetClubId)}`);
			setMoveModalVisible(false);
			setSelectedMemberIds([]);
			loadMembers();
		} catch (error) {
			console.error('Error moving members:', error);
			message.error('Failed to move members');
		}
	};

	// Helper function to get club name by ID
	const getClubNameById = (clubId: string): string => {
		const club = clubModel.data?.find((c) => c._id === clubId);
		return club ? club.name : 'Unknown Club';
	};

	// Log the member move activity
	const logMemberMove = (member: ClubMangement.Member, newClubId: string) => {
		const oldClub = getClubNameById(member.club_id);
		const newClub = getClubNameById(newClubId);

		// Get existing logs
		const logsData = localStorage.getItem('activity_logs');
		const logs = logsData ? JSON.parse(logsData) : [];

		// Create new log entry
		const newLog: ClubMangement.Activity_logs = {
			_id: applicationModel.generateUUID(),
			application_id: member.application_id,
			admin_id: 'current-admin-id', // In a real app, this would come from auth context
			action: 'Move',
			reason: `Moved from ${oldClub} to ${newClub}`,
			timestamp: new Date().toISOString(),
			details: JSON.stringify({
				from_club_id: member.club_id,
				to_club_id: newClubId,
				from_club_name: oldClub,
				to_club_name: newClub,
			}),
		};

		// Save updated logs
		localStorage.setItem('activity_logs', JSON.stringify([newLog, ...logs]));
	};

	// Show member history
	const showMemberHistory = (memberId: string, applicationId: string) => {
		// Get activity logs for this member
		const logsData = localStorage.getItem('activity_logs');
		const logs = logsData ? JSON.parse(logsData) : [];

		const memberLogs = logs.filter((log: ClubMangement.Activity_logs) => log.application_id === applicationId);

		setCurrentMemberLogs(memberLogs);
		setCurrentMemberId(memberId);
		setHistoryModalVisible(true);
	};

	// Define table columns
	const columns: IColumn<any>[] = [
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
			title: 'Current Club',
			dataIndex: 'club_name',
			width: 150,
			filterType: 'select',
			filters: clubModel.data?.map((club) => ({ text: club.name, value: club.name })) || [],
		},
		{
			title: 'Join Date',
			dataIndex: 'join_date',
			width: 120,
			sortable: true,
			render: (text: string) => {
				const date = new Date(text);
				return date.toLocaleDateString('vi-VN');
			},
		},
		{
			title: 'Actions',
			width: 200,
			align: 'center',
			render: (_, record) => (
				<Space size='small'>
					<Tooltip title='View Details'>
						<Button
							type='text'
							icon={<EyeOutlined />}
							onClick={() => {
								applicationModel.setRecord(record);
								applicationModel.setIsView(true);
								applicationModel.setEdit(false);
								applicationModel.setVisibleForm(true);
							}}
						/>
					</Tooltip>
					<Tooltip title='Edit Member'>
						<Button
							type='text'
							icon={<EditOutlined />}
							onClick={() => {
								applicationModel.setRecord(record);
								applicationModel.setEdit(true);
								applicationModel.setIsView(false);
								applicationModel.setVisibleForm(true);
							}}
						/>
					</Tooltip>
					<Tooltip title='Delete Member'>
						<Button type='text' danger icon={<DeleteOutlined />} onClick={() => deleteMember(record._id)} />
					</Tooltip>
					<Tooltip title='Move to Another Club'>
						<Button
							type='text'
							style={{ color: '#1890ff' }}
							icon={<UserSwitchOutlined />}
							onClick={() => {
								setSelectedMemberIds([record._id]);
								setMoveModalVisible(true);
							}}
						/>
					</Tooltip>
					<Tooltip title='View History'>
						<Button
							type='text'
							icon={<HistoryOutlined />}
							onClick={() => showMemberHistory(record._id, record.application_id)}
						/>
					</Tooltip>
				</Space>
			),
		},
	];

	// Delete a member
	const deleteMember = (memberId: string) => {
		Modal.confirm({
			title: 'Are you sure you want to remove this member?',
			content: 'This action cannot be undone.',
			okText: 'Yes, Remove',
			okType: 'danger',
			cancelText: 'Cancel',
			onOk: () => {
				try {
					const localMembers = localStorage.getItem('members');
					const membersData = localMembers ? JSON.parse(localMembers) : [];
					const updatedMembers = membersData.filter((member: ClubMangement.Member) => member._id !== memberId);
					localStorage.setItem('members', JSON.stringify(updatedMembers));
					message.success('Member removed successfully!');
					loadMembers();
				} catch (error) {
					console.error('Error deleting member:', error);
					message.error('Failed to remove member');
				}
			},
		});
	};

	// Delete multiple members
	const deleteManyMembers = async (ids: string[], callback?: () => void) => {
		try {
			const localMembers = localStorage.getItem('members');
			const membersData = localMembers ? JSON.parse(localMembers) : [];
			const updatedMembers = membersData.filter((member: ClubMangement.Member) => !ids.includes(member._id));
			localStorage.setItem('members', JSON.stringify(updatedMembers));
			message.success(`${ids.length} members removed successfully!`);
			loadMembers();
			if (callback) callback();
			return { success: true };
		} catch (error) {
			console.error('Error deleting members:', error);
			message.error('Failed to remove members');
			return { success: false };
		}
	};

	// Render club filter dropdown
	const renderClubFilter = () => {
		return (
			<Space style={{ marginBottom: 16 }}>
				<Select
					style={{ width: 250 }}
					placeholder='Filter by club'
					value={filteredClubId || undefined}
					onChange={(value) => setFilteredClubId(value)}
					allowClear
					onClear={() => setFilteredClubId(null)}
				>
					{clubModel.data?.map((club) => (
						<Select.Option key={club._id} value={club._id}>
							{club.name}
						</Select.Option>
					))}
				</Select>
				<Button
					type={filteredClubId ? 'primary' : 'default'}
					icon={<FilterOutlined />}
					onClick={() => setFilteredClubId(null)}
					disabled={!filteredClubId}
				>
					Clear Filter
				</Button>
			</Space>
		);
	};

	// Render bulk action button for moving members
	const renderMoveButton = () => {
		if (selectedMemberIds.length === 0) return null;

		return (
			<Button
				type='primary'
				icon={<SwapOutlined />}
				onClick={() => setMoveModalVisible(true)}
				style={{ marginBottom: 16, marginRight: 16 }}
			>
				Move {selectedMemberIds.length} member(s) to another club
			</Button>
		);
	};

	// Format timestamp for display
	const formatTimestamp = (timestamp: string) => {
		const date = new Date(timestamp);
		return date.toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		});
	};

	return (
		<>
			<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
				<div>{renderMoveButton()}</div>
				<div>{renderClubFilter()}</div>
			</div>

			<TableBase
				title={filteredClubId ? `Members of ${getClubNameById(filteredClubId)}` : 'All Club Members'}
				columns={columns}
				modelName='ClubMangement.application'
				deleteMany={true}
				rowSelection={true}
				getData={loadMembers}
				dataState='danhSach'
				Form={(props) => (
					<ApplicationForm
						onFinish={function (values: any): void {
							throw new Error('Function not implemented.');
						}}
						onCancel={function (): void {
							throw new Error('Function not implemented.');
						}}
						{...props}
						title={applicationModel.isEdit ? 'Edit Member' : applicationModel.isView ? 'Member Details' : 'New Member'}
						clubs={clubModel.data || []}
					/>
				)}
				formProps={{
					onFinish: (values) => {
						// Update member if needed
						applicationModel.setVisibleForm(false);
						loadMembers();
					},
					onCancel: () => applicationModel.setVisibleForm(false),
					record: applicationModel.record,
					isEdit: applicationModel.isEdit,
					isView: applicationModel.isView,
				}}
				formType='Modal'
				widthDrawer={700}
				// Override the model with our local state
				// This is a workaround since we're using the application model
				otherProps={{
					dataSource: members,
				}}
				deleteManyModel={deleteManyMembers}
				// When rows are selected, store their IDs
				detailRow={{
					onChange: (selectedRowKeys) => {
						setSelectedMemberIds(selectedRowKeys as string[]);
					},
				}}
			/>

			{/* Move Members Modal */}
			<Modal
				title={`Move ${selectedMemberIds.length} Member(s) to Another Club`}
				visible={moveModalVisible}
				onOk={handleMoveMembers}
				onCancel={() => setMoveModalVisible(false)}
			>
				<p>Please select the destination club:</p>
				<Select
					style={{ width: '100%' }}
					placeholder='Select destination club'
					onChange={(value) => setTargetClubId(value)}
					value={targetClubId}
				>
					{clubModel.data?.map((club) => (
						<Select.Option key={club._id} value={club._id}>
							{club.name}
						</Select.Option>
					))}
				</Select>
			</Modal>

			{/* Member History Modal */}
			<Modal
				title='Member Activity History'
				visible={historyModalVisible}
				onCancel={() => setHistoryModalVisible(false)}
				footer={[
					<Button key='close' onClick={() => setHistoryModalVisible(false)}>
						Close
					</Button>,
				]}
				width={600}
			>
				{currentMemberLogs.length === 0 ? (
					<Text>No activity history found for this member.</Text>
				) : (
					<div className='member-history'>
						{currentMemberLogs.map((log) => {
							// Parse details if it exists and is for a move action
							let details = null;
							if (log.action === 'Move' && log.details) {
								try {
									const detailsObj = JSON.parse(log.details);
									details = (
										<div style={{ marginTop: 8 }}>
											<Text type='secondary'>
												Moved from {detailsObj.from_club_name} to {detailsObj.to_club_name}
											</Text>
										</div>
									);
								} catch (e) {
									console.error('Error parsing log details', e);
								}
							}

							return (
								<div
									key={log._id}
									style={{
										marginBottom: 16,
										padding: 12,
										borderLeft: `4px solid ${
											log.action === 'Approve' ? 'green' : log.action === 'Reject' ? 'red' : 'blue'
										}`,
										backgroundColor: '#f5f5f5',
									}}
								>
									<div>
										<Text strong>{log.action}</Text> at {formatTimestamp(log.timestamp)}
									</div>
									<div style={{ marginTop: 4 }}>
										<Text>Reason: {log.reason}</Text>
									</div>
									{details}
								</div>
							);
						})}
					</div>
				)}
			</Modal>
		</>
	);
};

export default MemberManagement;
