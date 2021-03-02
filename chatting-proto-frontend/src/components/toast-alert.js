
export default {
  name: 'ToastAlert',
  props: {
    alertId: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: ''
    },
    noticeColor: {
      type: String,
      default: '#22aafb'
    }
  }
}
