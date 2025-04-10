import { v4 as uuidv4 } from 'uuid';
import { useState, useEffect } from 'react';
import { get } from 'lodash';

const STORAGE_KEY = 'club_management_clubs';

export default (key = 'club_management_clubs') => {
	// State for table data
	const [danhSach, setDanhSach] = useState<ClubMangement.Club[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [total, setTotal] = useState<number>(0);
	const [page, setPage] = useState<number>(1);
	const [limit, setLimit] = useState<number>(10);
	const [visibleForm, setVisibleForm] = useState<boolean>(false);
	const [record, setRecord] = useState<any>({});
	const [allClubs, setAllClubs] = useState<ClubMangement.Club[]>([]);
	const [isEdit, setEdit] = useState<boolean>(false);
	const [isView, setIsView] = useState<boolean>(false);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [filters, setFilters] = useState<any[]>([]);
	const [sort, setSort] = useState<any>({});
	const [condition, setCondition] = useState<any>({});
	const initFilter: any[] = [];

	// Load data from localStorage
	const getLocalClubs = (): ClubMangement.Club[] => {
		const data = localStorage.getItem(STORAGE_KEY);
		return data ? JSON.parse(data) : [];
	};

	const saveLocalClubs = (clubs: ClubMangement.Club[]) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(clubs));
	};
	// Save data to localStorage
	const saveToStorage = (data: ClubMangement.Club[]): void => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		} catch (error) {
			console.error('Error saving clubs to localStorage:', error);
		}
	};

	// Apply filtering
	const applyFilters = (data: ClubMangement.Club[], filters: any[]): ClubMangement.Club[] => {
		if (!filters || !filters.length) return data;

		return data.filter((item) => {
			return filters.every((filter) => {
				if (!filter.active) return true;

				const fieldValue = get(item, filter.field);
				if (filter.operator === 'CONTAIN') {
					return String(fieldValue).toLowerCase().includes(filter.values[0].toLowerCase());
				} else if (filter.operator === 'INCLUDE') {
					return filter.values.includes(String(fieldValue));
				}
				return true;
			});
		});
	};

	// Apply sorting
	const applySorting = (data: ClubMangement.Club[], sort: any): ClubMangement.Club[] => {
		if (!sort || Object.keys(sort).length === 0) return data;

		const sortField = Object.keys(sort)[0];
		const sortDirection = sort[sortField];

		return [...data].sort((a, b) => {
			const valueA = get(a, sortField);
			const valueB = get(b, sortField);

			if (typeof valueA === 'string' && typeof valueB === 'string') {
				return sortDirection * valueA.localeCompare(valueB);
			}

			if (valueA < valueB) return -1 * sortDirection;
			if (valueA > valueB) return 1 * sortDirection;
			return 0;
		});
	};

	// Apply pagination
	const applyPagination = (data: ClubMangement.Club[]): ClubMangement.Club[] => {
		const startIndex = (page - 1) * limit;
		return data.slice(startIndex, startIndex + limit);
	};

	// Main function to get club data
	const getModel = (params?: any) => {
		setLoading(true);

		try {
			let data = getLocalClubs();
			console.log(`Loaded ${data.length} clubs from storage`);

			// Apply additional condition if needed
			if (params) {
				data = data.filter((item) => {
					return Object.entries(params).every(([key, value]) => {
						return get(item, key) === value;
					});
				});
			}

			// Apply filters
			const filteredData = applyFilters(data, filters);
			console.log(`After filtering: ${filteredData.length} clubs`);

			// Apply sorting
			const sortedData = applySorting(filteredData, sort);

			// Set total count
			setTotal(sortedData.length);

			setAllClubs(sortedData); // chứa toàn bộ danh sách CLB sau khi lọc/sắp xếp

			// Apply pagination
			const paginatedData = applyPagination(sortedData);
			console.log(`After pagination: ${paginatedData.length} clubs`);

			// Update state
			setDanhSach(paginatedData);
		} catch (error) {
			console.error('Error getting club data:', error);
		} finally {
			setLoading(false);
		}
	};

	// Add new club
	const addClub = (clubData: Omit<ClubMangement.Club, '_id' | 'created_at' | 'updated_at'>) => {
		setLoading(true);

		try {
			const clubs = getLocalClubs();
			const now = new Date().toISOString();

			const newClub: ClubMangement.Club = {
				_id: uuidv4(),
				...clubData,
				created_at: now,
				updated_at: now,
			};

			const newData = [...clubs, newClub];
			saveToStorage(newData);
			console.log('Added new club:', newClub.name);

			// Refresh data
			getModel();

			return { success: true, data: newClub };
		} catch (error) {
			console.error('Error adding club:', error);
			return { success: false, error };
		} finally {
			setLoading(false);
		}
	};

	// Update existing club
	const updateClub = (id: string, clubData: Partial<Omit<ClubMangement.Club, '_id' | 'created_at' | 'updated_at'>>) => {
		setLoading(true);

		try {
			const clubs = getLocalClubs();
			const clubIndex = clubs.findIndex((club) => club._id === id);

			if (clubIndex === -1) {
				console.error('Club not found with id:', id);
				return { success: false, error: 'Club not found' };
			}

			const updatedClub = {
				...clubs[clubIndex],
				...clubData,

				updated_at: new Date().toISOString(),
			};

			clubs[clubIndex] = updatedClub;
			saveToStorage(clubs);
			console.log('Updated club:', updatedClub.name);

			// Refresh data
			getModel();

			return { success: true, data: updatedClub };
		} catch (error) {
			console.error('Error updating club:', error);
			return { success: false, error };
		} finally {
			setLoading(false);
		}
	};

	// Delete a club
	const deleteClub = (id: string) => {
		setLoading(true);

		try {
			const clubs = getLocalClubs();
			const newClubs = clubs.filter((club) => club._id !== id);

			saveToStorage(newClubs);
			console.log('Deleted club with id:', id);

			// Refresh data
			getModel();

			return { success: true };
		} catch (error) {
			console.error('Error deleting club:', error);
			return { success: false, error };
		} finally {
			setLoading(false);
		}
	};

	// Delete multiple clubs
	const deleteManyModel = async (ids: string[], callback?: () => void) => {
		setLoading(true);

		try {
			const clubs = getLocalClubs();
			const newClubs = clubs.filter((club) => !ids.includes(club._id));

			saveToStorage(newClubs);
			console.log(`Deleted ${ids.length} clubs`);

			// Refresh data after deletion
			getModel();

			// Call callback if provided
			if (callback) callback();

			return { success: true };
		} catch (error) {
			console.error('Error deleting multiple clubs:', error);
			return { success: false, error };
		} finally {
			setLoading(false);
		}
	};
	// Clear all data
	const clearData = () => {
		localStorage.removeItem(STORAGE_KEY);
		setDanhSach([]);
		setTotal(0);
		console.log('Cleared all club data');
	};

	// Add event listener for changes in localStorage from other tabs
	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === STORAGE_KEY) {
				console.log('Storage changed in another tab, refreshing data');
				getModel();
			}
		};

		window.addEventListener('storage', handleStorageChange);
		return () => {
			window.removeEventListener('storage', handleStorageChange);
		};
	}, []);

	// Update data when page or limit changes
	useEffect(() => {
		getModel();
	}, [page, limit, JSON.stringify(filters), JSON.stringify(sort)]);

	return {
		data: danhSach,
		allClubs, // dùng cái này cho biểu đồ
		setData: setDanhSach,
		getModel,
		addClub,
		updateClub,
		deleteClub,
		deleteManyModel,
		clearData,
		loading,
		total,
		page,
		setPage,
		limit,
		setLimit,
		visibleForm,
		setVisibleForm,
		record,
		setRecord,
		isEdit,
		setEdit,
		isView,
		setIsView,
		selectedIds,
		setSelectedIds,
		filters,
		setFilters,
		sort,
		setSort,
		condition,
		setCondition,
		initFilter,
	};
	// Function removed as `setAllClubs` is now a state setter from useState.
};
