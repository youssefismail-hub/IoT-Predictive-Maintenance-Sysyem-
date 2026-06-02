import { Role } from './role.model';

export interface User {
    uid: string;
    name: string;
    email: string;
    role: Role;
    isActive: boolean;
    createdAt: Date;
}
