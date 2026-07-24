export function getPassportConfig() {
  return {
    defaultStrategy: 'jwt',
    property: 'user',
    session: false
  }
}
