import React from 'react';
import { Form, Input, Select, Button, Row, Col } from 'antd';
import TextArea from 'antd/lib/input/TextArea';

interface ApplicationFormProps {
	onFinish: (values: any) => void;
	onCancel: () => void;
	title: string;
	record?: ClubMangement.Application | null;
	isEdit?: boolean;
	isView?: boolean;
	clubs: ClubMangement.Club[];
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({
	onFinish,
	onCancel,
	title,
	record,
	isEdit,
	isView,
	clubs,
}) => {
	const [form] = Form.useForm();

	React.useEffect(() => {
		if (record) {
			form.setFieldsValue({ ...record });
		} else {
			form.resetFields();
		}
	}, [record, form]);

	return (
		<div>
			<h2>{title}</h2>
			<Form form={form} layout='vertical' onFinish={onFinish} disabled={isView} initialValues={record || {}}>
				<Row gutter={16}>
					<Col span={12}>
						<Form.Item
							name='full_name'
							label='Full Name'
							rules={[{ required: true, message: 'Please enter full name' }]}
						>
							<Input placeholder='Enter full name' />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name='email'
							label='Email'
							rules={[
								{ required: true, message: 'Please enter email' },
								{ type: 'email', message: 'Please enter a valid email' },
							]}
						>
							<Input placeholder='Enter email' />
						</Form.Item>
					</Col>
				</Row>

				<Row gutter={16}>
					<Col span={12}>
						<Form.Item
							name='phone_number'
							label='Phone Number'
							rules={[{ required: true, message: 'Please enter phone number' }]}
						>
							<Input placeholder='Enter phone number' />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name='gender' label='Gender' rules={[{ required: true, message: 'Please select gender' }]}>
							<Select placeholder='Select gender'>
								<Select.Option value='Nam'>Nam</Select.Option>
								<Select.Option value='Nữ'>Nữ</Select.Option>
								<Select.Option value='Khác'>Khác</Select.Option>
							</Select>
						</Form.Item>
					</Col>
				</Row>

				<Form.Item name='address' label='Address' rules={[{ required: true, message: 'Please enter address' }]}>
					<Input placeholder='Enter address' />
				</Form.Item>

				<Form.Item
					name='desired_club_id'
					label='Desired Club'
					rules={[{ required: true, message: 'Please select a club' }]}
				>
					<Select placeholder='Select club'>
						{clubs.map((club) => (
							<Select.Option key={club._id} value={club._id}>
								{club.name}
							</Select.Option>
						))}
					</Select>
				</Form.Item>

				<Form.Item
					name='strengths'
					label='Strengths'
					rules={[{ required: true, message: 'Please enter your strengths' }]}
				>
					<TextArea rows={3} placeholder='Enter your strengths' />
				</Form.Item>

				<Form.Item
					name='reason'
					label='Reason for Applying'
					rules={[{ required: true, message: 'Please enter your reason for applying' }]}
				>
					<TextArea rows={4} placeholder='Why do you want to join this club?' />
				</Form.Item>

				{(isEdit || isView) && (
					<Form.Item name='status' label='Status'>
						<Select disabled={isView}>
							<Select.Option value='pending'>Pending</Select.Option>
							<Select.Option value='approved'>Approved</Select.Option>
							<Select.Option value='rejected'>Rejected</Select.Option>
						</Select>
					</Form.Item>
				)}

				{(isEdit || isView) && (
					<Form.Item name='notes' label='Notes'>
						<TextArea rows={3} placeholder='Additional notes' disabled={isView} />
					</Form.Item>
				)}

				<Row justify='end'>
					<Col>
						<Button onClick={onCancel} style={{ marginRight: 16 }}>
							Cancel
						</Button>
						{!isView && (
							<Button type='primary' htmlType='submit'>
								{isEdit ? 'Update' : 'Submit'}
							</Button>
						)}
					</Col>
				</Row>
			</Form>
		</div>
	);
};

export default ApplicationForm;
