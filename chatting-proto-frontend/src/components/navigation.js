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
};
