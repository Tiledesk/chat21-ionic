export function getOSCode(key: string, token: string): boolean {

    if (token) {
      const keys: String[] = token.split("-");

      let element = keys.find(el => el.includes(key))
      console.log('keys', keys)
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