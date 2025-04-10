import React, { useEffect } from 'react';
import { Form, Input, DatePicker, Switch, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';
import type { UploadFile } from 'antd/es/upload/interface';
import moment from 'moment';

interface ClubFormProps {
	title: string;
	record?: Partial<ClubMangement.Club>;
	isEdit?: boolean;
	isView?: boolean;
	onFinish?: (values: any) => void;
	onCancel?: () => void;
}

const ClubForm: React.FC<ClubFormProps> = ({ title, record, isEdit, isView, onFinish, onCancel }) => {
	const [form] = Form.useForm();

	useEffect(() => {
		if (record) {
			// Transform date string to moment object for DatePicker
			const formValues = {
				...record,
				established_date: record.established_date ? moment(record.established_date) : undefined,
			};
			form.setFieldsValue(formValues);
		} else {
			form.resetFields();
		}
	}, [record, form]);

	const handleFinish = (values: any) => {
		// Transform moment object back to string for established_date
		const submitValues = {
			...values,
			established_date: values.established_date ? values.established_date.format('YYYY-MM-DD') : undefined,
		};

		if (onFinish) {
			onFinish(submitValues);
		}
	};

	const normFile = (e: any) => {
		if (Array.isArray(e)) {
			return e;
		}
		return e?.fileList;
	};

	return (
		<div className='club-form'>
			<div className='form-header' style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
				<h2>
					{isEdit ? 'Chỉnh sửa' : isView ? 'Chi tiết' : 'Thêm mới'} {title}
				</h2>
			</div>

			<Form form={form} layout='vertical' disabled={isView} onFinish={handleFinish} style={{ padding: '24px' }}>
				<Form.Item name='name' label='Tên CLB' rules={[{ required: true, message: 'Vui lòng nhập tên CLB' }]}>
					<Input placeholder='Nhập tên câu lạc bộ' />
				</Form.Item>

				<Form.Item
					name='club_leader_name'
					label='Trưởng CLB'
					rules={[{ required: true, message: 'Vui lòng nhập tên trưởng CLB' }]}
				>
					<Input placeholder='Nhập tên trưởng câu lạc bộ' />
				</Form.Item>

				<Form.Item
					name='established_date'
					label='Ngày thành lập'
					rules={[{ required: true, message: 'Vui lòng chọn ngày thành lập' }]}
				>
					<DatePicker style={{ width: '100%' }} placeholder='Chọn ngày' format='DD/MM/YYYY' />
				</Form.Item>

				<Form.Item name='avatar_url' label='Ảnh đại diện' valuePropName='fileList' getValueFromEvent={normFile}>
					<Input placeholder='Nhập URL ảnh đại diện' />
					{/* For a real implementation, you'd use Upload component:
          <Upload 
            listType="picture"
            maxCount={1}
            beforeUpload={() => false}
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
          */}
				</Form.Item>

				<Form.Item name='description' label='Mô tả'>
					{/* For a real implementation, you'd use a rich text editor like ReactQuill */}
					<Input.TextArea rows={4} placeholder='Nhập mô tả câu lạc bộ' />
				</Form.Item>

				<Form.Item name='is_active' label='Trạng thái hoạt động' valuePropName='checked'>
					<Switch checkedChildren='Hoạt động' unCheckedChildren='Không hoạt động' />
				</Form.Item>

				{!isView && (
					<Form.Item className='form-footer' style={{ marginBottom: 0, textAlign: 'right' }}>
						<Button onClick={onCancel} style={{ marginRight: 8 }}>
							Hủy
						</Button>
						<Button type='primary' htmlType='submit'>
							{isEdit ? 'Cập nhật' : 'Thêm mới'}
						</Button>
					</Form.Item>
				)}
			</Form>
		</div>
	);
};

export default ClubForm;
