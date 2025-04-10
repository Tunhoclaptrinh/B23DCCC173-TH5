import React from 'react';
import TableBase from '@/components/Table';
import { IColumn } from '@/components/Table/typing';
import { useModel } from 'umi';
import { Button, Tag, Space, Modal, Table } from 'antd'; // Thêm Table
import { EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import ClubForm from '../../../components/ClubMangaement/form';

const Club = () => {
	const model = useModel('ClubMangement.club');
	const [visibleMembersModal, setVisibleMembersModal] = React.useState(false);
	const [selectedClubMembers, setSelectedClubMembers] = React.useState<
		(ClubMangement.Member & Partial<ClubMangement.Application>)[]
	>([]); // Kết hợp thông tin Member và Application

	// Function to handle form submission
	const handleFormSubmit = (values: any) => {
		if (model.isEdit) {
			const result = model.updateClub(model.record._id, values);
			if (result.success) {
				model.setVisibleForm(false);
			} else {
				console.error('Failed to update club:', result.error);
			}
		} else {
			const result = model.addClub(values);
			if (result.success) {
				model.setVisibleForm(false);
			} else {
				console.error('Failed to add club:', result.error);
			}
		}
	};

	// Function to handle delete
	const handleDelete = (id: string) => {
		model.deleteClub(id);
	};

	// Function to fetch members of a club with application details
	const fetchClubMembers = (clubId: string) => {
		const members: ClubMangement.Member[] = JSON.parse(localStorage.getItem('members') || '[]');
		const applications: ClubMangement.Application[] = JSON.parse(localStorage.getItem('applications') || '[]');

		// Lọc thành viên theo clubId
		const clubMembers = members.filter((member) => member.club_id === clubId);

		// Kết hợp thông tin từ Application
		const enrichedMembers = clubMembers.map((member) => {
			const application = applications.find((app) => app._id === member.application_id);
			return { ...member, ...application }; // Gộp thông tin Member và Application
		});

		setSelectedClubMembers(enrichedMembers);
		setVisibleMembersModal(true);
	};

	// Define table columns for clubs
	const columns: IColumn<ClubMangement.Club>[] = [
		{
			title: 'Ảnh đại diện',
			dataIndex: 'avatar_url',
			width: 100,
			render: (text: string) => (
				<img src={text} alt='avatar' style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }} />
			),
		},
		{
			title: 'Tên CLB',
			dataIndex: 'name',
			width: 250,
			sortable: true,
			filterType: 'string',
		},
		{
			title: 'Trưởng CLB',
			dataIndex: 'club_leader_name',
			width: 150,
			sortable: true,
			filterType: 'string',
		},
		{
			title: 'Hoạt động',
			dataIndex: 'is_active',
			width: 120,
			render: (value: boolean) => (
				<Tag color={value ? 'green' : 'red'}>{value ? 'Đang hoạt động' : 'Ngừng hoạt động'}</Tag>
			),
		},
		{
			title: 'Ngày thành lập',
			dataIndex: 'established_date',
			width: 140,
			sortable: true,
			render: (text: string) => {
				const date = new Date(text);
				return date.toLocaleDateString('vi-VN');
			},
		},
		{
			title: 'Mô tả',
			dataIndex: 'description',
			width: 300,
			ellipsis: true,
			render: (html: string) => <div dangerouslySetInnerHTML={{ __html: html }} />,
		},
		{
			title: 'Hành động',
			width: 150,
			align: 'center',
			render: (_, record) => (
				<Space size='small'>
					<Button
						type='text'
						icon={<EyeOutlined />}
						onClick={() => fetchClubMembers(record._id)} // Gọi hàm lấy danh sách thành viên
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
					/>
					<Button type='text' danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)} />
				</Space>
			),
		},
	];

	// Define columns for members table in modal
	const memberColumns = [
		{
			title: 'Họ và tên',
			dataIndex: 'full_name',
			key: 'full_name',
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
		},
		{
			title: 'Số điện thoại',
			dataIndex: 'phone_number',
			key: 'phone_number',
		},
		{
			title: 'Giới tính',
			dataIndex: 'gender',
			key: 'gender',
		},
		{
			title: 'Ngày tham gia',
			dataIndex: 'join_date',
			key: 'join_date',
			render: (text: string) => new Date(text).toLocaleDateString('vi-VN'),
		},
	];

	return (
		<>
			<TableBase
				title='Câu lạc bộ'
				columns={columns}
				modelName='ClubMangement.club'
				rowSelection={true}
				deleteMany={true}
				Form={(props) => (
					<ClubForm {...props} title={model.isEdit ? 'Chỉnh sửa CLB' : model.isView ? 'Xem CLB' : 'Thêm mới CLB'} />
				)}
				dataState='data'
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

			{/* Modal hiển thị danh sách thành viên */}
			<Modal
				title='Danh sách thành viên'
				visible={visibleMembersModal}
				onCancel={() => setVisibleMembersModal(false)}
				footer={null}
				width={800}
			>
				{selectedClubMembers.length > 0 ? (
					<Table columns={memberColumns} dataSource={selectedClubMembers} rowKey='_id' pagination={false} />
				) : (
					<p>Chưa có thành viên nào trong CLB này.</p>
				)}
			</Modal>
		</>
	);
};

export default Club;
