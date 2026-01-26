import { ProjectUser } from "src/chat21-core/models/projectUsers";

export function getOSCode(key: string, token: string): boolean {

    if (token) {
      const keys: String[] = token.split("-");

      let element = keys.find(el => el.includes(key))
      // console.log('keys', keys)
      if(element){
        element = element.split(":")[1]
        if(element && element === "F"){
          return false
        } else {
          return true
        }
      }

      if (!token.includes(key)) {
        return false;
      }

    } 

    return false
}


export function hasRole(projectUser: ProjectUser, role: string ): boolean {
  let roles = ['owner', 'admin', 'agent'];
  if(roles.includes(projectUser.role)){
    return true
  }

  if(Array.isArray(projectUser.rolePermissions) && projectUser.rolePermissions.includes(role)){
    return true
  }

  return false

}