export interface ProjectUser {
    _id?: string;
    id?: string;
    __v?: any;
    attributes?: any;
    createdAt?: string | any;
    createdBy?: string;
    id_project?: any;
    id_user?: any;
    isAuthenticated?: boolean;
    isBusy?: boolean;
    is_group_member?: boolean;
    last_login_at?: string;
    number_assigned_requests?: number;
    permissions?: any;
    presence?: { [key: string]: string } | any;
    profileStatus?: string;
    role?: string;
    roleType?: number;
    rolePermissions?: string[];
    status?: string;
    tags?: any;
    trashed?: boolean;
    updatedAt?: string | any;
    user_available?: boolean;
    /** Derived in UI (e.g. from getUserStatusFromProjectUser) */
    teammateStatus?: any;
}