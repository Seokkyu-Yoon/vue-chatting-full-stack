import store from '@/store';

export default {
  name: 'Login',
  data() {
    return {
      isValid: false,
      userName: '',
    };
  },
  methods: {
    setUserName(e) {
      this.userName = e.target.value.replace(' ', '');
      this.$request('req:user:valid', { userName: this.userName });
    },
    login(e) {
      e.preventDefault();
      if (!this.isValid) {
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
  beforeCreate() {
    this.$socket.on('res:user:valid', (isValid) => {
      this.isValid = isValid;
    });
  },
  mounted() {
    const alert = document.querySelector('#alert');
    alert.addEventListener('animationend', () => {
      alert.style.removeProperty('animation');
    });
  },
};
