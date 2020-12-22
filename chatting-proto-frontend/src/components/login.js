import store from '@/store';

export default {
  name: 'Login',
  data() {
    return {
      store,
      userName: '',
    };
  },
  methods: {
    setUserName(e) {
      this.userName = e.target.value.replace(' ', '');
      this.$request('req:user:valid', { userName: this.userName });
    },
    login() {
      if (!store.isValidUsername) {
        this.$refs.alert.style.animation = 'shake 0.5s 1';
        this.$refs.nicknameField.focus();
        return;
      }

      store.userName = this.userName;
      this.$request('req:user:login', {
        userName: this.userName,
      });
      this.$router.push('Rooms');
    },
  },
  beforeCreate() {
    if (store.userName) {
      this.$router.push('Rooms');
    }
  },
  mounted() {
    const { alert, nicknameField } = this.$refs;
    alert.addEventListener('animationend', () => {
      alert.style.removeProperty('animation');
    });
    nicknameField.focus();
  },
};
