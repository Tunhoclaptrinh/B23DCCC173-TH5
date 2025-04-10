import React, { useState } from 'react';
import { Card, Row, Col, Select, Button } from 'antd';
import * as XLSX from 'xlsx';
import { useModel } from 'umi';
import ColumnChart from '@/components/Chart/ColumnChart';
import { ApexOptions } from 'apexcharts';

const { Option } = Select;

const Dashboard = () => {
	const { applications } = useModel('ClubMangement.application');
	const { data: clubs } = useModel('ClubMangement.club');
	const [selectedClub, setSelectedClub] = useState<string>('');

	const stats = {
		totalClubs: clubs.length,
		pendingApplications: applications.filter((app) => app.status === 'Pending').length,
		approvedApplications: applications.filter((app) => app.status === 'Approved').length,
		rejectedApplications: applications.filter((app) => app.status === 'Rejected').length,
	};

	const chartData = {
		xAxis: clubs.map((club) => club.name),
		yAxis: [
			clubs.map(
				(club) => applications.filter((app) => app.desired_club_id === club._id && app.status === 'Pending').length,
			),
			clubs.map(
				(club) => applications.filter((app) => app.desired_club_id === club._id && app.status === 'Approved').length,
			),
			clubs.map(
				(club) => applications.filter((app) => app.desired_club_id === club._id && app.status === 'Rejected').length,
			),
		],
		yLabel: ['Chờ duyệt', 'Đã duyệt', 'Từ chối'],
		colors: ['#1890ff', '#52c41a', '#f5222d'],
		height: 400,
		showTotal: true,
		otherOptions: {
			chart: {
				stacked: true,
				toolbar: {
					show: true,
				},
			},
			plotOptions: {
				bar: {
					horizontal: false,
					columnWidth: '60%',
					endingShape: 'rounded',
				},
			},
			xaxis: {
				title: {
					text: 'Câu lạc bộ',
					style: {
						fontSize: '14px',
						fontWeight: 'bold',
					},
				},
				labels: {
					rotate: -45,
					style: {
						fontSize: '12px',
					},
				},
			},
			yaxis: {
				title: {
					text: 'Số lượng đơn',
					style: {
						fontSize: '14px',
						fontWeight: 'bold',
					},
				},
			},
			legend: {
				position: 'top',
				horizontalAlign: 'center',
			},
		} as ApexOptions,
	};

	const exportToExcel = () => {
		let dataToExport = applications
			.filter((app) => app.status === 'Approved')
			.map((app) => {
				const club = clubs.find((c) => c._id === app.desired_club_id);
				return {
					'Họ tên': app.full_name,
					Email: app.email,
					SĐT: app.phone_number,
					'Giới tính': app.gender,
					CLB: club?.name || app.desired_club_id,
					'Ngày tham gia': new Date(app.updated_at).toLocaleDateString(),
				};
			});

		if (selectedClub) {
			dataToExport = dataToExport.filter((item) => item.CLB === clubs.find((c) => c._id === selectedClub)?.name);
		}

		const wb = XLSX.utils.book_new();
		const ws = XLSX.utils.json_to_sheet(dataToExport);

		XLSX.utils.book_append_sheet(wb, ws, 'Danh sách thành viên');

		const fileName = selectedClub
			? `Danh_sach_thanh_vien_${clubs.find((c) => c._id === selectedClub)?.name}.xlsx`
			: 'Danh_sach_thanh_vien_tat_ca_CLB.xlsx';

		XLSX.writeFile(wb, fileName);
	};

	return (
		<div style={{ padding: 24 }}>
			<h1>Thống kê đăng ký thành viên</h1>

			<Row gutter={16} style={{ marginBottom: 24 }}>
				<Col span={6}>
					<Card title='Tổng số CLB' bordered={false}>
						<h2 style={{ fontSize: 24 }}>{stats.totalClubs}</h2>
					</Card>
				</Col>
				<Col span={6}>
					<Card title='Đơn chờ duyệt' bordered={false}>
						<h2 style={{ fontSize: 24, color: '#1890ff' }}>{stats.pendingApplications}</h2>
					</Card>
				</Col>
				<Col span={6}>
					<Card title='Đơn đã duyệt' bordered={false}>
						<h2 style={{ fontSize: 24, color: '#52c41a' }}>{stats.approvedApplications}</h2>
					</Card>
				</Col>
				<Col span={6}>
					<Card title='Đơn từ chối' bordered={false}>
						<h2 style={{ fontSize: 24, color: '#f5222d' }}>{stats.rejectedApplications}</h2>
					</Card>
				</Col>
			</Row>

			<Card title='Thống kê đơn đăng ký theo CLB' style={{ marginBottom: 24 }}>
				<ColumnChart {...chartData} title='Biểu đồ số lượng đơn đăng ký theo CLB' />
			</Card>

			<Card title='Xuất danh sách thành viên'>
				<div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
					<Select
						style={{ width: 300 }}
						placeholder='Chọn CLB (để xuất tất cả để trống)'
						allowClear
						value={selectedClub}
						onChange={setSelectedClub}
					>
						{clubs.map((club) => (
							<Option key={club._id} value={club._id}>
								{club.name}
							</Option>
						))}
					</Select>

					<Button
						type='primary'
						onClick={exportToExcel}
						disabled={applications.filter((app) => app.status === 'Approved').length === 0}
					>
						Xuất file Excel
					</Button>
				</div>
			</Card>
		</div>
	);
};

export default Dashboard;
