import store from '@/store';

export default {
  name: 'Login',
  data() {
    return {
      userName: '',
    };
  },
  methods: {
    setUserName(e) {
      this.userName = String(e.target.value).replace(' ', '');
    },
    login() {
      if (this.userName === '') {
        document.querySelector('#alert').style.animation = 'shake 0.5s 1';
        return;
      }
      store.userName = this.userName;

      this.$request('req:user:login', {
        userName: this.userName,
      });
      this.$router.push({ name: 'Chatting' });
    },
  },
  mounted() {
    const alert = document.querySelector('#alert');
    alert.addEventListener('animationend', () => {
      alert.style.removeProperty('animation');
    });
  },
};
