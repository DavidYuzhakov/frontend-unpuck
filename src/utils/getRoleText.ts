export const getRoleText = (role: string) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'Администратор'
    case 'seller':
      return 'Продавец'
    case 'blogger':
      return 'Блогер'
    case 'buyer':
      return 'Покупатель'
    case 'manager':
      return 'Менеджер'
    default:
      return role
  }
}
