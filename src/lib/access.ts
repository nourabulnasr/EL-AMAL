export function hasRole(user:unknown,roles:readonly string[]):boolean {
 return !!user && typeof user==='object' && 'role' in user && typeof user.role==='string' && roles.includes(user.role);
}
type Reviewable = {name?:{en?:string;ar?:string};description?:{en?:string;ar?:string};sourceRef?:string;reviewedBy?:unknown;reviewedAt?:string;rightsConfirmed?:boolean};
export function canPublish(data:Reviewable):boolean {
 return !!(data.name?.en?.trim()&&data.name?.ar?.trim()&&data.description?.en?.trim()&&data.description?.ar?.trim()&&data.sourceRef?.trim()&&data.reviewedBy&&data.reviewedAt&&Number.isFinite(Date.parse(data.reviewedAt))&&data.rightsConfirmed===true);
}
