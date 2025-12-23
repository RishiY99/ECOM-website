// Import necessary Angular core modules
import { ChangeDetectorRef, Component, signal, computed, WritableSignal } from '@angular/core';
// ↑ NEW IMPORTS FOR SIGNALS:
// - signal: Creates a writable signal (reactive state container)
// - computed: Creates a derived signal that automatically updates when dependencies change
// - WritableSignal: TypeScript type for signals that can be modified

import { CommonModule } from '@angular/common';

// Import ReactiveFormsModule for reactive form functionality
// FormBuilder: Service to create FormGroup instances
// FormGroup: Represents the entire form and tracks its value and validation state
// Validators: Provides built-in validation functions like required, email, etc.
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Import custom services and types
import { ProductServies } from '../../services/product-servies';
import { cart, priceSummary } from '../../services/types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  // Replace FormsModule with ReactiveFormsModule for reactive forms
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {

  // ============================================================================
  // 🚀 ANGULAR SIGNALS DEMONSTRATION
  // ============================================================================

  // ❌ OLD WAY (Traditional Properties):
  // cartitmes: cart[] | undefined
  // price: number | undefined
  // message: string | undefined

  // ✅ NEW WAY (Using Signals):

  // SIGNAL #1: Cart Items
  // signal() creates a reactive state container
  // WritableSignal<cart[]> means this signal holds an array of cart items
  // Initial value is empty array []
  cartitmes: WritableSignal<cart[]> = signal<cart[]>([]);
  // HOW IT WORKS:
  // - Read value: this.cartitmes() ← Note the parentheses!
  // - Update value: this.cartitmes.set([...newItems])
  // - Angular automatically tracks when this changes

  // SIGNAL #2: Price
  // Signal holding the total price as a number
  // Initial value is 0
  price: WritableSignal<number> = signal<number>(0);
  // HOW IT WORKS:
  // - Read: this.price()
  // - Update: this.price.set(500)
  // - Template automatically updates when price changes

  // SIGNAL #3: Message
  // Signal for order status messages
  // Initial value is empty string
  message: WritableSignal<string> = signal<string>('');
  // HOW IT WORKS:
  // - Read: this.message()
  // - Update: this.message.set('Order placed!')
  // - No need for ChangeDetectorRef!

  // BONUS: COMPUTED SIGNAL (Derived State)
  // computed() creates a signal that automatically recalculates when dependencies change
  // This is like a "live formula" that updates automatically
  formattedPrice = computed(() => {
    // This function runs automatically whenever price() changes
    const priceValue = this.price(); // ← Dependency: price signal
    return `₹${priceValue.toFixed(2)}`; // Format as currency
  });
  // HOW IT WORKS:
  // - Automatically recalculates when this.price() changes
  // - Read: this.formattedPrice() ← Always up-to-date!
  // - Cannot be set manually (read-only)
  // - More efficient than manual calculations

  // FormGroup instance that represents the entire checkout form
  // It contains all form controls and tracks the form's state (valid/invalid, touched/untouched, etc.)
  checkoutForm!: FormGroup;

  // Inject FormBuilder to create reactive forms easily
  // FormBuilder provides a shorthand way to create FormControl, FormGroup, and FormArray instances
  constructor(
    private product: ProductServies,
    private crf: ChangeDetectorRef,
    private route: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    // Initialize the reactive form with FormBuilder
    // fb.group() creates a FormGroup with multiple FormControls
    this.checkoutForm = this.fb.group({
      // 'name' FormControl with initial value '' and required validator
      // Validators.required ensures the field cannot be empty
      name: ['', Validators.required],

      // 'email' FormControl with two validators:
      // 1. Validators.required - field must have a value
      // 2. Validators.email - value must be a valid email format
      email: ['', [Validators.required, Validators.email]],

      // 'phone' FormControl with required validator
      // Stores the user's phone number
      phone: ['', Validators.required],

      // 'address' FormControl with required validator
      // Stores the delivery address as a text area input
      address: ['', Validators.required]
    });

    // Subscribe to the cart list observable to fetch current cart items
    this.product.cartlist().subscribe((res) => {
      // ✅ SIGNAL UPDATE: Using .set() to update the signal
      // OLD WAY: this.cartitmes = res
      // NEW WAY: this.cartitmes.set(res)
      this.cartitmes.set(res);
      // When we call .set(), Angular automatically:
      // 1. Updates the signal value
      // 2. Notifies all components/templates using this signal
      // 3. Triggers re-render where needed (no manual change detection!)

      // Initialize price accumulator
      let price = 0

      // Loop through each cart item to calculate total price
      res.forEach((item: cart) => {
        // Calculate price: item price * quantity, then add to total
        // +item.price converts string to number if needed
        price = price + (+item.price * item.quantity)
      });

      // ✅ SIGNAL UPDATE: Set the calculated price
      // OLD WAY: this.price = price
      // NEW WAY: this.price.set(price)
      this.price.set(price);
      // Benefits:
      // - Template {{price()}} updates automatically
      // - formattedPrice computed signal recalculates automatically
      // - No need for this.crf.detectChanges()!

      // NOTE: With signals, we don't need manual change detection!
      // OLD WAY: this.crf.detectChanges() ← Not needed anymore!
      // Signals automatically notify Angular of changes
    })
  }

  // Method called when the form is submitted
  placeOrder() {
    // Check if the form is valid before processing
    // The form is valid only if all validators pass


    // Retrieve user data from localStorage
    let user = localStorage.getItem('user')

    // Parse the user JSON and extract the user ID
    // The && operator ensures we only parse if user exists
    let user_id = user && JSON.parse(user).id

    // ✅ SIGNAL READ: Get current price value using ()
    // OLD WAY: if (this.price)
    // NEW WAY: if (this.price() > 0)
    const currentPrice = this.price(); // Read signal value with ()

    // Check if price exists before placing order
    if (currentPrice > 0) {
      // Create the order object by combining:
      // 1. Form values (name, email, phone, address)
      // 2. User ID from localStorage
      // 3. Total price calculated from cart
      let product = {
        ...this.checkoutForm.value, // Spread operator to include all form field values
        user_id, // Add the user ID
        total: currentPrice // Add the total price (from signal)
      }

      // ✅ SIGNAL READ: Get current cart items
      // OLD WAY: this.cartitmes?.forEach(...)
      // NEW WAY: this.cartitmes().forEach(...)
      const items = this.cartitmes(); // Read signal value

      // Loop through each cart item to delete them after order placement
      items.forEach((item) => {
        // Use setTimeout to delay deletion by 2 seconds
        setTimeout(() => {
          // Check if item has an ID before attempting to delete
          if (item.id) {
            // Call service method to delete the cart item
            this.product.deleteorder(item.id)
          }
        }, 2000); // 2000ms = 2 seconds delay
      })

      // Call the orders service to submit the order
      this.product.orders(product).subscribe((res) => {
        // Check if the order was successfully created
        if (res) {
          // Display success message after 2 seconds
          setTimeout(() => {
            // ✅ SIGNAL UPDATE: Set success message
            // OLD WAY: this.message = "order placed successfully"
            // NEW WAY: this.message.set("order placed successfully")
            this.message.set("order placed successfully");
            // Template {{message()}} updates automatically!
          }, 2000);

          // ✅ SIGNAL UPDATE: Clear the message initially
          // OLD WAY: this.message = ""
          // NEW WAY: this.message.set("")
          this.message.set("");

          // Navigate to the 'myorders' page to show order history
          this.route.navigate(['/myorders'])

          // NOTE: No need for manual change detection with signals!
          // OLD WAY: this.crf.detectChanges() ← Not needed!
          // Signals handle reactivity automatically
        }
      })
    }
  }

  // ============================================================================
  // 📊 SIGNALS SUMMARY
  // ============================================================================

  // TRADITIONAL PROPERTIES vs SIGNALS:

  // ❌ OLD WAY:
  // - price: number | undefined
  // - Read: this.price
  // - Write: this.price = 100
  // - Need: this.crf.detectChanges() for updates

  // ✅ NEW WAY (SIGNALS):
  // - price: WritableSignal<number> = signal(0)
  // - Read: this.price() ← Note parentheses!
  // - Write: this.price.set(100)
  // - Automatic: Change detection happens automatically!

  // BENEFITS OF SIGNALS:
  // ✓ Automatic reactivity (no manual change detection)
  // ✓ Better performance (fine-grained updates)
  // ✓ Computed values update automatically
  // ✓ Easier to track data flow
  // ✓ Type-safe with TypeScript
  // ✓ Works great with OnPush change detection strategy
}
