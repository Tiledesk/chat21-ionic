export interface ProjectUser {
    _id?: string;
    updatedAt?: any;
    createdAt?: any;
    id_project?: string;
    user_available?: boolean;
    role?: string;
    createdBy?: string;
    is_group_member?: boolean;
    // id_user?: string;
    isAuthenticated?: boolean;
    isBusy?: boolean;
    status?: string;
    id_user?: any;
    rolePermissions?: string[];
    profileStatus?: string;
    presence?: { [key: string]: string}
    __v?: any;
}