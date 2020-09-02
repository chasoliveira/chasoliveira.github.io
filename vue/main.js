var eventBus = new Vue();

Vue.component('product', {
  props: {
    premium: {
      type: Boolean,
      required: true
    }
  },
  template: `
    <div class="product">
    <div class="product-image">
      <img v-bind:src="image" alt="" />
    </div>
    <div class="product-info">
      <h1>{{ productBrand }}</h1>
      <p v-if="inStock">In Stock</p>
      <p v-else>Out of Stock</p>
      <p>Shipping: {{ shipping }}</p>


      <ul>
        <li v-for="detail in details">{{ detail }}</li>
      </ul>

      <div v-for="(variant, index) in variants" 
          :key="variant.id"
          class="color-box"
          :style="{ backgroundColor: variant.color }"
          @mouseover="updateProduct(index)">
      </div>

      <ul>
        <li v-for="size in sizes">{{ size }}</li>
      </ul>

      <button v-on:click="addToCart" 
              :disabled="!inStock"
              :class="{ disabledButton: !inStock }">Add to Cart</button>
      <button v-on:click="removeFromCart">Remove Item</button>
    </div>

    <product-tabs :reviews="reviews"/>
  </div>`,
  data() {
    return {
      brand: 'Vue Masterfull',
      product: 'Socks',
      selectedVariant: 0,
      details: ["80% coton", "20% polyester", "Gender-neutral"],
      variants: [
        { id: 2234, color: 'green', quantity: 10, image: './assets/vmSocks-green-onWhite.jpg' },
        { id: 2235, color: 'blue', quantity: 0, image: './assets/vmSocks-blue-onWhite.jpg' }
      ],
      sizes: ['P', 'M', 'L', 'X', 'XL'],
      onSale: true,
      reviews: []
    }
  },
  methods: {
    addToCart() {
      this.$emit('add-to-cart', this.variants[this.selectedVariant].id);
    },
    removeFromCart() {
      this.$emit('remove-from-cart', this.variants[this.selectedVariant].id);
    },
    updateProduct(index) {
      this.selectedVariant = index;
    }
  },
  computed: {
    title() { return `${this.brand} ${this.product}`; },
    image() { return this.variants[this.selectedVariant].image; },
    inStock() { return this.variants[this.selectedVariant].quantity },
    productBrand() { return this.onSale ? `${this.brand} ${this.product}` : ''; },
    shipping() { return this.premium ? 'Free' : '2.99'; }
  },
  mounted() {
    eventBus.$on('review-submitted', productReview => {
      this.reviews.push(productReview);
    });
  }
});

Vue.component('product-view', {
  template: `
    <form class="review-form" @submit.prevent="onSubmit">
      <p v-if="errors.length">
        <b>Please correct the follwing error(s):</b>
        <ul>
          <li v-for="error in errors">{{ error }}</li>
        </ul>
      </p>
      <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name"/>
      </p>
      <p>
        <label for="review">Review:</label>
        <textarea id="review" v-model="review"/>
      </p>
      <p>
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </p>
      <p>
        <label htmlFor="recommend">Would you recommend this product?</label>
        <input type="radio" v-model="recommend" name="recommend" value="true">
        <input type="radio" v-model="recommend" name="recommend" value="false">
        
      </p>
      <p>
        <input type="submit" value="submit" />
      </p>
    </form>
  `,
  data() {
    return { name: null, review: null, rating: null, recommend: null, errors: [] }
  },
  methods: {
    onSubmit() {
      if (this.name && this.review && this.rating && this.recommend) {
        let productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating
        };
        eventBus.$emit('review-submitted', productReview);
        this.name = null;
        this.review = null;
        this.rating = null;
        this.recommend = null;
        this.errors = [];
      }
      else {
        if (!this.name && !this.errors.some(e => e.includes("Name"))) this.errors.push("Name id required!");
        if (!this.review && !this.errors.some(e => e.includes("Review"))) this.errors.push("Review id required!");
        if (!this.rating && !this.errors.some(e => e.includes("Rating"))) this.errors.push("Rating id required!");
        if (!this.recommend && !this.errors.some(e => e.includes("Recommend"))) this.errors.push("Recommend id required!");
      }
    }
  }
});

Vue.component('product-tabs', {
  props: {
    reviews: {
      type: Array,
      required: true
    }
  },
  template: `
    <div>
      <span class="tab"
            :class="{ activeTab: selectedTab == tab }"
            v-for="(tab, index) in tabs" 
            :key="index"
            @click="selectedTab = tab">
            {{ tab }}</span>

      <div v-show="selectedTab === 'Reviews'">
        <p v-if="!reviews.length">There are no reviews yet.</p>
        <ul>
          <li v-for="review in reviews">
            <p>{{review.name}}</p>
            <p>Rating {{review.rating}}</p>
            <p>{{review.review}}</p>
          </li>
        </ul>
      </div>
      <product-view v-show="selectedTab === 'Make a Review'" />
    </div>
  `,
  data() {
    return {
      tabs: ['Reviews', 'Make a Review'],
      selectedTab: 'Reviews'
    }
  }
});

var app = new Vue({
  el: '#app',
  data: {
    premium: true,
    cart: [],
  },
  methods: {
    updateCart(id) {
      this.cart.push(id);
    },
    removeFromCart(id) {
      this.cart = this.cart.filter(i => i !== id);
    }
  }
})