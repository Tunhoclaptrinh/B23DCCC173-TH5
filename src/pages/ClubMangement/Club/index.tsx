import React from 'react';
import TableBase from '@/components/Table';
import { IColumn } from '@/components/Table/typing';
import { useModel } from 'umi';
import { Button, Tag, Space, Input } from 'antd';
import { EditOutlined, EyeOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import ClubForm from '../../../components/ClubMangaement/form';

const Club = () => {
	const model = useModel('ClubMangement.club');

	// Function to handle form submission
	const handleFormSubmit = (values: any) => {
		if (model.isEdit) {
			// Update existing club
			const result = model.updateClub(model.record._id, values);
			if (result.success) {
				model.setVisibleForm(false);
			} else {
				console.error('Failed to update club:', result.error);
			}
		} else {
			// Add new club
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

	// Define table columns
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
			// filterType: 'string',
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
						onClick={() => {
							model.setRecord(record);
							model.setIsView(true);
							model.setEdit(false);
							model.setVisibleForm(true);
						}}
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
				dataState='data' //thêm dòng này để Table lấy từ model.data
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
		</>
	);
};

export default Club;
