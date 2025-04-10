declare module ClubMangement {
	export interface Club {
		_id: string; // (PK)
		name: string;
		established_date: string;
		description: string; // (HTML)
		// club_leader_id: string; // (FK) user_id của Leader => Tạm thời không cần vì đề yêu cầu nhập Text
		club_leader_name: string; // tên của leader
		avatar_url: string;
		is_active: boolean; // (true/false)
		created_at: string;
		updated_at: string;
	}

	export interface Application {
		_id: string; // (PK)
		full_name: string;
		email: string;
		phone_number: string;
		gender: Nam | Nữ | Khác;
		address: string;
		strengths: string;
		desired_club_id: string; //(FK to clubs)
		reason: string;
		status: string; //(pending, approved, rejected)
		notes: string;
		created_at: string;
		updated_at: string;
	}

	export interface Member {
		_id: string; // (PK)
		application_id: string; //(FK to applications)
		club_id: string; //(FK to clubs)
		join_date: string;
		created_at: string;
		updated_at: string;
	}

	export interface Activity_logs {
		_id: string; // (PK)
		application_id: string; //(FK to applications)
		admin_id: string; //(FK to users)
		action: Approve | Reject | Move; //(approve, reject, move)
		reason: string;
		timestamp: string;
		details: string; //(JSON - can store additional info like "moved from club X to club Y")
	}
}
