import store from '@/store';

export default {
  data() {
    return { store };
  },
  computed: {
    logined() {
      return this.store.userName !== '';
    },
  },
  methods: {
    showMyInfo() {
      // eslint-disable-next-line no-alert
      alert('구현 중');
    },
  },
};
