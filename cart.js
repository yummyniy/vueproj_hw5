// import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js';
const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;
const apiurl = 'https://vue3-course-api.hexschool.io/v2';
const apipath = 'testpp';

defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);

loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json');

configure({
    generateMessage: localize('zh_TW'),
});

const app = Vue.createApp({
    data() {
        return {
            cartData: {
                carts: []
            },
            products: [],
            productID: '',
            isLoadingID: '',
            form: {
                user: {
                    name: '',
                    email: '',
                    tel: '',
                    address: '',
                },
                message: '',
            },
        };
    },
    components: {
        VForm: Form,
        VField: Field,
        ErrorMessage: ErrorMessage,
    },
    methods: {
        getProducts() {
            axios.get(apiurl + '/api/' + apipath + '/products/all')
                .then((res) => {
                    this.products = res.data.products;
            });
        },
        openProductModal(id) {
            this.productID = id;
            this.$refs.productModal.openModal();
        },
        getCarts() {
            axios.get(apiurl + '/api/' + apipath + '/cart')
                .then((res) => {
                    this.cartData = res.data.data;
            });
        },
        addToCart(id, qty = 1) {
            const data = {
                product_id: id,
                qty,
            };
            this.isLoadingID =  id;
            axios.post(apiurl + '/api/' + apipath + '/cart', { data })
                .then((res) => {
                    this.getCarts();
                    this.isLoadingID = '';
                    this.$refs.productModal.closeModal();
                    alert(res.data.message);
            });
        },
        updateCart(item) {
            const data = {
                product_id: item.id,
                qty: item.qty,
            };
            axios.put(apiurl + '/api/' + apipath + '/cart/' + item.id, { data })
                .then((res) => {
                    this.getCarts();
                    this.isLoadingID = '';
                    alert(res.data.message);
            });
        },
        deleteCart(id) {
            this.isLoadingID =  id;
            axios.delete(apiurl + '/api/' + apipath + '/cart/' + id)
                .then((res) => {
                    this.getCarts();
                    this.isLoadingID = '';
                    alert(res.data.message);
            });
        },
        deleteAllCart() {
            axios.delete(apiurl + '/api/' + apipath + '/carts')
                .then((res) => {
                    this.getCarts();
                    this.isLoadingID = '';
                    alert(res.data.message);
            });
        },
        createOrder() {
            const order = this.form;
            axios.post(apiurl + '/api/' + apipath + '/order', { data: order })
                .then((res) => {
                    alert(res.data.message);
                    this.$refs.form.resetForm();
                    // this.deleteAllCart();
                    this.getCarts();
                    this.isLoadingID = '';
            });
        },
    },
    mounted() {
        this.getProducts();
        this.getCarts();
    }
});

app.component('productModal', {
    template: '#userProductModal',
    data() {
        return {
            productModal: {},
            product: {},
            qty: 1,
        }
    },
    watch: {
        id() {
            this.getProduct();
        }
    },
    methods: {
        openModal() {
            this.productModal.show();
        },
        closeModal() {
            this.productModal.hide();
        },
        getProduct() {
            axios.get(apiurl + '/api/' + apipath + '/product/' + this.id)
                .then((res) => {
                    console.dir(res.data);
                    this.product = res.data.product;
            });
        },
        addToCart() {
            this.$emit('addCart', this.product.id, this.qty);
        }
    },
    props: ['id'],
    mounted() {
        this.productModal = new bootstrap.Modal(this.$refs.modal, {
            keyboard: false,
            backdrop: 'static'
        });
    }
});
app.mount('#app');