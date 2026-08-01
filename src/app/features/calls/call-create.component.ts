import { Component, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CallService } from '../../../core/services/call.service';
import { BrandService } from '../../../core/services/brand.service';
import { ProductService } from '../../../core/services/product.service';
import { ProductModelService } from '../../../core/services/product-model.service';
import { ProductIssueService } from '../../../core/services/product-issue.service';
import { Brand } from '../../../core/models/brand.model';
import { Product } from '../../../core/models/product.model';
import { ProductModel } from '../../../core/models/product-model.model';
import { ProductIssue } from '../../../core/models/product-issue.model';

@Component({
  selector: 'app-call-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
<div class="create-wrapper animate-fade-in">
  <!-- Step Indicator -->
  <div class="steps-bar">
    @for (s of steps; track s.num) {
      <div class="step" [class.active]="currentStep === s.num" [class.done]="currentStep > s.num" (click)="goStep(s.num)">
        <div class="step-circle">{{ currentStep > s.num ? '✓' : s.num }}</div>
        <span class="step-label">{{ s.label }}</span>
      </div>
      @if (!$last) { <div class="step-line" [class.done]="currentStep > s.num"></div> }
    }
  </div>

  @if (successMessage) {
    <div class="alert alert-success">✓ {{ successMessage }}</div>
  }
  @if (errorMessage) {
    <div class="alert alert-error">{{ errorMessage }}</div>
  }

  <!-- STEP 1: Customer Detail -->
  @if (currentStep === 1) {
    <div class="step-card animate-fade-in">
      <div class="step-header"><h3>Customer Details</h3><p>Basic customer information</p></div>
      <form [formGroup]="customerForm">
        <div class="form-row-3">
          <div class="fg">
            <label class="lbl">Title</label>
            <select class="inp" formControlName="title">
              <option value="">Select</option>
              <option>Mr</option><option>Mrs</option><option>Ms</option><option>Dr</option>
            </select>
          </div>
          <div class="fg">
            <label class="lbl">First Name *</label>
            <input class="inp" formControlName="firstName" placeholder="First Name" />
          </div>
          <div class="fg">
            <label class="lbl">Last Name</label>
            <input class="inp" formControlName="lastName" placeholder="Last Name" />
          </div>
        </div>
        <div class="fg">
          <label class="lbl">Address Line 1</label>
          <input class="inp" formControlName="address1" placeholder="House/Flat No, Street" />
        </div>
        <div class="form-row-2">
          <div class="fg"><label class="lbl">Landmark</label><input class="inp" formControlName="landmark" placeholder="Near..." /></div>
          <div class="fg"><label class="lbl">Locality</label><input class="inp" formControlName="locality" placeholder="Colony/Area" /></div>
        </div>
        <div class="form-row-4">
          <div class="fg">
            <label class="lbl">State</label>
            <select class="inp" formControlName="state" (change)="onStateChange($event)">
              <option value="">Select State</option>
              @for (s of states; track s) { <option [value]="s">{{ s }}</option> }
            </select>
          </div>
          <div class="fg">
            <label class="lbl">District</label>
            <select class="inp" formControlName="district" (change)="onDistrictChange($event)" [attr.disabled]="!districts.length ? true : null">
              <option value="">Select District</option>
              @for (d of districts; track d) { <option [value]="d">{{ d }}</option> }
            </select>
          </div>
          <div class="fg">
            <label class="lbl">City</label>
            <select class="inp" formControlName="city" [attr.disabled]="!cities.length ? true : null">
              <option value="">Select City</option>
              @for (c of cities; track c) { <option [value]="c">{{ c }}</option> }
            </select>
          </div>
          <div class="fg"><label class="lbl">Pincode</label><input class="inp" type="number" formControlName="pincode" placeholder="000000" /></div>
        </div>
      </form>
    </div>
  }

  <!-- STEP 2: Contact Detail -->
  @if (currentStep === 2) {
    <div class="step-card animate-fade-in">
      <div class="step-header"><h3>Contact Details</h3><p>Customer contact information</p></div>
      <form [formGroup]="contactForm">
        <div class="form-row-2">
          <div class="fg"><label class="lbl">Mobile *</label><input class="inp" formControlName="mobile" placeholder="10-digit mobile" /></div>
          <div class="fg"><label class="lbl">Email</label><input class="inp" type="email" formControlName="email" placeholder="email@example.com" /></div>
        </div>
        <div class="form-row-2">
          <div class="fg"><label class="lbl">Contact Person Name</label><input class="inp" formControlName="contactPersonName" placeholder="Alternate contact" /></div>
          <div class="fg"><label class="lbl">Contact Person Mobile</label><input class="inp" formControlName="contactPersonMobile" placeholder="Mobile" /></div>
        </div>
        <div class="fg">
          <label class="lbl">Preferred Language</label>
          <div class="checkbox-group">
            @for (lang of languages; track lang) {
              <label class="checkbox-item">
                <input type="checkbox" [checked]="isLangSelected(lang)" (change)="toggleLang(lang)" />
                <span>{{ lang }}</span>
              </label>
            }
          </div>
        </div>
      </form>
    </div>
  }

  <!-- STEP 3: Dealer Detail -->
  @if (currentStep === 3) {
    <div class="step-card animate-fade-in">
      <div class="step-header"><h3>Dealer Details</h3><p>Purchase and dealer information</p></div>
      <form [formGroup]="dealerForm">
        <div class="form-row-2">
          <div class="fg"><label class="lbl">Dealer Name</label><input class="inp" formControlName="dealerName" placeholder="Dealer/Shop name" /></div>
          <div class="fg"><label class="lbl">Dealer City</label><input class="inp" formControlName="dealerCity" placeholder="City" /></div>
        </div>
        <div class="form-row-2">
          <div class="fg"><label class="lbl">Dealer Mobile</label><input class="inp" formControlName="dealerMobile" placeholder="Contact number" /></div>
          <div class="fg"><label class="lbl">Dealer Email</label><input class="inp" type="email" formControlName="dealerEmail" placeholder="dealer@example.com" /></div>
        </div>
        <div class="form-row-2">
          <div class="fg"><label class="lbl">Invoice Number</label><input class="inp" formControlName="invoiceNumber" placeholder="INV-XXXX" /></div>
          <div class="fg"><label class="lbl">Purchase Date</label><input class="inp" type="date" formControlName="purchaseDate" /></div>
        </div>
      </form>
    </div>
  }

  <!-- STEP 4: Product Detail (with cascading dropdowns) -->
  @if (currentStep === 4) {
    <div class="step-card animate-fade-in">
      <div class="step-header"><h3>Product Details</h3><p>Select brand, product, model and issue</p></div>
      <form [formGroup]="productForm">
        <div class="cascade-info">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Select Brand first, then Product will auto-filter, then Model & Issue will populate.
        </div>
        <div class="form-row-2">
          <div class="fg">
            <label class="lbl">Brand *</label>
            <select class="inp" formControlName="brand" (change)="onBrandChange($event)">
              <option value="">-- Select Brand --</option>
              @for (b of brands; track b.id) { <option [value]="b.id">{{ b.name }}</option> }
            </select>
          </div>
          <div class="fg">
            <label class="lbl">Client Type</label>
            <select class="inp" formControlName="client">
              <option value="">Select</option>
              <option>Retail</option><option>Corporate</option><option>Government</option><option>Distributor</option>
            </select>
          </div>
        </div>
        <div class="form-row-2">
          <div class="fg">
            <label class="lbl">Product * <span class="cascade-note">{{ !productForm.get('brand')?.value ? '(select brand first)' : '' }}</span></label>
            <select class="inp" formControlName="product" (change)="onProductChange($event)" [attr.disabled]="!filteredProducts.length ? true : null">
              <option value="">-- Select Product --</option>
              @for (p of filteredProducts; track p.id) { <option [value]="p.id">{{ p.name }}</option> }
            </select>
          </div>
          <div class="fg">
            <label class="lbl">Model * <span class="cascade-note">{{ !productForm.get('product')?.value ? '(select product first)' : '' }}</span></label>
            <select class="inp" formControlName="model" [attr.disabled]="!filteredModels.length ? true : null">
              <option value="">-- Select Model --</option>
              @for (m of filteredModels; track m.id) { <option [value]="m.id">{{ m.modelName }}</option> }
            </select>
          </div>
        </div>
        <div class="fg">
          <label class="lbl">Issue <span class="cascade-note">{{ !productForm.get('product')?.value ? '(select product first)' : '' }}</span></label>
          <select class="inp" formControlName="issue" [attr.disabled]="!filteredIssues.length ? true : null">
            <option value="">-- Select Issue --</option>
            @for (i of filteredIssues; track i.id) { <option [value]="i.id">{{ i.issueName }}</option> }
          </select>
        </div>
        <div class="form-row-3">
          <div class="fg"><label class="lbl">Unit Serial Number</label><input class="inp" formControlName="unitSerialNumber" placeholder="SN-XXXX" /></div>
          <div class="fg"><label class="lbl">Warranty</label><input class="inp" formControlName="warranty" placeholder="e.g. 1 Year" /></div>
          <div class="fg"><label class="lbl">Stock Of</label><input class="inp" formControlName="stockOf" placeholder="Warehouse/Store" /></div>
        </div>
        <div class="fg"><label class="lbl">Purchase Order Number</label><input class="inp" formControlName="purchaseOrderNumber" placeholder="PO-XXXX" /></div>
      </form>
    </div>
  }

  <!-- STEP 5: Complaint Detail -->
  @if (currentStep === 5) {
    <div class="step-card animate-fade-in">
      <div class="step-header"><h3>Complaint Details</h3><p>Service request information</p></div>
      <form [formGroup]="complaintForm">
        <div class="form-row-3">
          <div class="fg">
            <label class="lbl">Call Type</label>
            <select class="inp" formControlName="callType">
              <option value="">Select</option>
              <option>Installation</option><option>Repair</option><option>Demo</option><option>AMC</option><option>Other</option>
            </select>
          </div>
          <div class="fg">
            <label class="lbl">Complaint Priority</label>
            <select class="inp" formControlName="complaintPriority">
              <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
            </select>
          </div>
          <div class="fg">
            <label class="lbl">Call Nature</label>
            <select class="inp" formControlName="callNature">
              <option value="">Select</option>
              <option>Service</option><option>Installation</option><option>Complaint</option><option>Inquiry</option>
            </select>
          </div>
        </div>
        <div class="form-row-2">
          <div class="fg">
            <label class="lbl">Visit Type</label>
            <select class="inp" formControlName="visitType">
              <option value="">Select</option><option>Home</option><option>Service Center</option><option>On-Site</option>
            </select>
          </div>
          <div class="fg"><label class="lbl">Last Complaint Number</label><input class="inp" formControlName="lastComplaintNumber" placeholder="LC-XXXX" /></div>
        </div>
        <div class="fg">
          <label class="lbl">Complaint Description *</label>
          <textarea class="inp" formControlName="complaintDescription" rows="3" placeholder="Describe the issue in detail..."></textarea>
        </div>
        <div class="fg">
          <label class="lbl">Special Instructions</label>
          <textarea class="inp" formControlName="specialInstruction" rows="2" placeholder="Any special instructions for the technician..."></textarea>
        </div>
        <div class="form-row-3">
          <div class="fg"><label class="lbl">Promise Date</label><input class="inp" type="date" formControlName="promiseDate" /></div>
          <div class="fg"><label class="lbl">Promise Time</label><input class="inp" type="time" formControlName="promiseTime" /></div>
          <div class="fg">
            <label class="lbl">AM / PM</label>
            <select class="inp" formControlName="amOrPm"><option>AM</option><option>PM</option></select>
          </div>
        </div>
      </form>
    </div>
  }

  <!-- Footer Navigation -->
  <div class="step-footer">
    <button class="btn-back" (click)="prevStep()" [disabled]="currentStep === 1">← Back</button>
    <div class="step-indicator-text">Step {{ currentStep }} of {{ steps.length }}</div>
    @if (currentStep < steps.length) {
      <button class="btn-next" (click)="nextStep()">Next →</button>
    } @else {
      <button class="btn-submit" (click)="onSubmit()" [disabled]="isSubmitting">
        {{ isSubmitting ? 'Registering...' : '✓ Register Call' }}
      </button>
    }
  </div>
</div>
  `,
  styles: [`
    .create-wrapper { display:flex; flex-direction:column; gap:1.25rem; }
    .alert { padding:0.75rem 1rem; border-radius:8px; font-size:0.875rem; font-weight:500; }
    .alert-success { background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; }
    .alert-error { background:#fef2f2; color:#991b1b; border:1px solid #fca5a5; }

    /* Steps bar */
    .steps-bar { display:flex; align-items:center; background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:1rem 1.5rem; gap:0; overflow-x:auto; }
    .step { display:flex; flex-direction:column; align-items:center; gap:0.3rem; cursor:pointer; min-width:80px; }
    .step-circle { width:30px; height:30px; border-radius:50%; background:var(--border); color:var(--text-muted); display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:700; transition:all 0.2s; }
    .step.active .step-circle { background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; box-shadow:0 3px 10px rgba(79,70,229,0.35); }
    .step.done .step-circle { background:#10b981; color:#fff; }
    .step-label { font-size:0.7rem; font-weight:600; color:var(--text-muted); text-align:center; }
    .step.active .step-label { color:#4f46e5; }
    .step.done .step-label { color:#10b981; }
    .step-line { flex:1; height:2px; background:var(--border); min-width:20px; }
    .step-line.done { background:#10b981; }

    /* Step Card */
    .step-card { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:1.75rem; box-shadow:var(--shadow-sm); }
    .step-header { margin-bottom:1.25rem; border-bottom:1px solid var(--border); padding-bottom:0.875rem; }
    .step-header h3 { font-size:1.1rem; font-weight:800; color:var(--text-primary); margin:0; }
    .step-header p { font-size:0.8rem; color:var(--text-secondary); margin:0.2rem 0 0; }

    /* Form */
    .form-row-2 { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    .form-row-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem; }
    .form-row-4 { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:1rem; }
    .fg { margin-bottom:1rem; }
    .lbl { display:block; font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-secondary); margin-bottom:0.4rem; }
    .inp { width:100%; padding:0.6rem 0.85rem; font-size:0.875rem; color:var(--text-primary); background:var(--surface); border:1.5px solid var(--border); border-radius:8px; box-sizing:border-box; font-family:inherit; transition:border-color 0.15s, box-shadow 0.15s; }
    .inp:focus { outline:none; border-color:#4f46e5; box-shadow:0 0 0 3px rgba(79,70,229,0.12); }
    .inp:disabled { background:var(--surface-2); color:var(--text-muted); cursor:not-allowed; }

    .cascade-info { display:flex; align-items:center; gap:0.5rem; background:rgba(79,70,229,0.1); border:1px solid rgba(79,70,229,0.2); border-radius:8px; padding:0.6rem 0.875rem; font-size:0.8rem; color:var(--primary); margin-bottom:1rem; }
    .cascade-note { font-size:0.65rem; font-weight:600; color:var(--text-muted); text-transform:none; letter-spacing:0; }

    .checkbox-group { display:flex; flex-wrap:wrap; gap:0.625rem; margin-top:0.25rem; }
    .checkbox-item { display:flex; align-items:center; gap:0.375rem; background:var(--surface-2); border:1.5px solid var(--border); border-radius:7px; padding:0.4rem 0.75rem; cursor:pointer; font-size:0.825rem; font-weight:500; color:var(--text-secondary); transition:all 0.15s; }
    .checkbox-item:has(input:checked) { background:rgba(79,70,229,0.1); border-color:#4f46e5; color:#4f46e5; }
    .checkbox-item input { accent-color:#4f46e5; }

    /* Footer */
    .step-footer { display:flex; align-items:center; justify-content:space-between; background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:1rem 1.5rem; }
    .step-indicator-text { font-size:0.8rem; font-weight:600; color:var(--text-muted); }
    .btn-back { padding:0.575rem 1.125rem; font-size:0.875rem; font-weight:600; background:var(--surface); color:var(--text-secondary); border:1.5px solid var(--border); border-radius:8px; cursor:pointer; font-family:inherit; transition:all 0.15s; }
    .btn-back:hover:not(:disabled) { background:var(--surface-2); }
    .btn-back:disabled { opacity:0.4; cursor:not-allowed; }
    .btn-next { padding:0.575rem 1.25rem; font-size:0.875rem; font-weight:700; background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; border:none; border-radius:8px; cursor:pointer; font-family:inherit; box-shadow:0 3px 10px rgba(79,70,229,0.3); transition:all 0.2s; }
    .btn-next:hover { transform:translateY(-1px); box-shadow:0 5px 14px rgba(79,70,229,0.4); }
    .btn-submit { padding:0.575rem 1.5rem; font-size:0.9rem; font-weight:700; background:linear-gradient(135deg,#059669,#047857); color:#fff; border:none; border-radius:8px; cursor:pointer; font-family:inherit; box-shadow:0 3px 10px rgba(5,150,105,0.3); transition:all 0.2s; }
    .btn-submit:hover:not(:disabled) { transform:translateY(-1px); }
    .btn-submit:disabled { opacity:0.6; cursor:not-allowed; }

    .animate-fade-in { animation:fadeIn 0.25s ease-out both; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  `]
})
export class CallCreateComponent implements OnInit {
  @Output() callCreated = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private callService = inject(CallService);
  private brandService = inject(BrandService);
  private productService = inject(ProductService);
  private modelService = inject(ProductModelService);
  private issueService = inject(ProductIssueService);

  currentStep = 1;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  brands: Brand[] = [];
  products: Product[] = [];
  models: ProductModel[] = [];
  issues: ProductIssue[] = [];
  filteredProducts: Product[] = [];
  filteredModels: ProductModel[] = [];
  filteredIssues: ProductIssue[] = [];
  languages = ['English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Bengali', 'Kannada'];
  selectedLanguages: string[] = [];

  // Dropdown States/Districts/Cities data
  statesData: { [key: string]: { [key: string]: string[] } } = {
    'Andhra Pradesh': {
      'Visakhapatnam': ['Visakhapatnam City', 'Bheemunipatnam', 'Anakapalle'],
      'Guntur': ['Guntur City', 'Tenali', 'Narasaraopet', 'Mangalagiri'],
      'Krishna': ['Vijayawada', 'Machilipatnam', 'Gudivada'],
      'Kurnool': ['Kurnool City', 'Nandyal', 'Adoni']
    },
    'Delhi': {
      'Central Delhi': ['Connaught Place', 'Chandni Chowk', 'Paharganj'],
      'New Delhi': ['Chanakyapuri', 'Parliament Street', 'RK Puram'],
      'South Delhi': ['Saket', 'Mehrauli', 'Hauz Khas', 'Lajpat Nagar'],
      'East Delhi': ['Preet Vihar', 'Mayur Vihar', 'Geeta Colony'],
      'West Delhi': ['Rajouri Garden', 'Tilak Nagar', 'Janakpuri'],
      'North Delhi': ['Civil Lines', 'Model Town', 'Rohini']
    },
    'Gujarat': {
      'Ahmedabad': ['Ahmedabad City', 'Sanand', 'Bavla', 'Dholka', 'Detroj'],
      'Surat': ['Surat City', 'Chorasi', 'Bardoli', 'Olpad', 'Kamrej'],
      'Vadodara': ['Vadodara City', 'Padra', 'Karjan', 'Waghodia'],
      'Rajkot': ['Rajkot City', 'Gondal', 'Jasdan', 'Jetpur'],
      'Gandhinagar': ['Gandhinagar City', 'Mansa', 'Dehgam']
    },
    'Haryana': {
      'Gurugram': ['Gurugram City', 'Sohna', 'Pataudi', 'Farukhnagar'],
      'Faridabad': ['Faridabad City', 'Ballabhgarh', 'Tigaon'],
      'Hisar': ['Hisar City', 'Hansi', 'Barwala'],
      'Ambala': ['Ambala City', 'Ambala Cantt', 'Naraingarh']
    },
    'Karnataka': {
      'Bengaluru Urban': ['Bengaluru City', 'Anekal', 'Yelahanka', 'Doddaballapur'],
      'Bengaluru Rural': ['Hoskote', 'Doddaballapur', 'Kanakapura', 'Ramanagara'],
      'Mysuru': ['Mysuru City', 'Nanjangud', 'T Narasipura', 'Hunsur', 'K R Nagar'],
      'Dharwad': ['Hubli-Dharwad', 'Kalghatgi', 'Navalgund'],
      'Belagavi': ['Belagavi City', 'Gokak', 'Bailhongal', 'Chikodi'],
      'Mangaluru': ['Mangaluru City', 'Bantwal', 'Belthangady', 'Puttur']
    },
    'Kerala': {
      'Thiruvananthapuram': ['Thiruvananthapuram City', 'Neyyattinkara', 'Attingal'],
      'Ernakulam': ['Kochi City', 'Aluva', 'Muvattupuzha', 'Kothamangalam'],
      'Kozhikode': ['Kozhikode City', 'Vatakara', 'Koyilandy'],
      'Thrissur': ['Thrissur City', 'Chalakudy', 'Kodungallur']
    },
    'Madhya Pradesh': {
      'Bhopal': ['Bhopal City', 'Berasia', 'Phanda'],
      'Indore': ['Indore City', 'Mhow', 'Sanwer', 'Depalpur'],
      'Gwalior': ['Gwalior City', 'Bhitarwar', 'Dabra'],
      'Jabalpur': ['Jabalpur City', 'Sihora', 'Patan']
    },
    'Maharashtra': {
      'Mumbai City': ['Colaba', 'Fort', 'Dharavi', 'Kurla', 'Sion'],
      'Mumbai Suburban': ['Andheri', 'Bandra', 'Borivali', 'Goregaon', 'Malad', 'Kandivali'],
      'Pune': ['Pune City', 'Pimpri-Chinchwad', 'Haveli', 'Baramati', 'Khed'],
      'Nagpur': ['Nagpur City', 'Kamptee', 'Hingna', 'Umred'],
      'Nashik': ['Nashik City', 'Sinnar', 'Niphad', 'Igatpuri'],
      'Aurangabad': ['Aurangabad City', 'Kannad', 'Paithan', 'Vaijapur']
    },
    'Punjab': {
      'Amritsar': ['Amritsar City', 'Ajnala', 'Baba Bakala'],
      'Ludhiana': ['Ludhiana City', 'Jagraon', 'Raikot', 'Samrala'],
      'Jalandhar': ['Jalandhar City', 'Nakodar', 'Shahkot', 'Phillaur'],
      'Patiala': ['Patiala City', 'Samana', 'Nabha', 'Fatehgarh Sahib']
    },
    'Rajasthan': {
      'Jaipur': ['Jaipur City', 'Amber', 'Phulera', 'Dudu'],
      'Jodhpur': ['Jodhpur City', 'Phalodi', 'Bilara', 'Osian'],
      'Udaipur': ['Udaipur City', 'Girwa', 'Mavli', 'Salumber'],
      'Kota': ['Kota City', 'Ladpura', 'Sangod', 'Pipalda']
    },
    'Tamil Nadu': {
      'Chennai': ['Chennai City', 'Ambattur', 'Tambaram', 'Avadi'],
      'Coimbatore': ['Coimbatore City', 'Mettupalayam', 'Pollachi', 'Annur'],
      'Madurai': ['Madurai City', 'Melur', 'Peraiyur', 'Usilampatti'],
      'Tiruchirappalli': ['Tiruchirappalli City', 'Musiri', 'Lalgudi', 'Manachanallur'],
      'Salem': ['Salem City', 'Edapadi', 'Omalur', 'Mettur']
    },
    'Telangana': {
      'Hyderabad': ['Hyderabad City', 'LB Nagar', 'Secunderabad', 'Kukatpally'],
      'Rangareddy': ['Rajendranagar', 'Chevella', 'Vikarabad', 'Tandur'],
      'Medchal': ['Kompally', 'Keesara', 'Shamirpet'],
      'Warangal Urban': ['Warangal City', 'Hanamkonda', 'Kazipet']
    },
    'Uttar Pradesh': {
      'Lucknow': ['Lucknow City', 'Mohanlalganj', 'Bakshi Ka Talab', 'Malihabad'],
      'Agra': ['Agra City', 'Fatehabad', 'Khandauli', 'Fatehpur Sikri'],
      'Kanpur Nagar': ['Kanpur City', 'Ghatampur', 'Bithoor', 'Kalyanpur'],
      'Varanasi': ['Varanasi City', 'Pindra', 'Arajiline', 'Kashi Vidyapeeth'],
      'Noida (Gautam Buddh Nagar)': ['Noida', 'Greater Noida', 'Dadri', 'Jewar']
    },
    'West Bengal': {
      'Kolkata': ['Kolkata City', 'Dum Dum', 'Jadavpur', 'Behala'],
      'North 24 Parganas': ['Barasat', 'Barrackpore', 'Bongaon', 'Basirhat'],
      'South 24 Parganas': ['Alipurduar', 'Diamond Harbour', 'Joynagar'],
      'Howrah': ['Howrah City', 'Uluberia', 'Bagnan', 'Amta']
    },
    'Chhattisgarh': {
      'Raipur': ['Raipur City', 'Arang', 'Abhanpur', 'Tilda'],
      'Durg': ['Bhilai', 'Durg City', 'Patan', 'Bemetara'],
      'Bilaspur': ['Bilaspur City', 'Takhatpur', 'Mungeli']
    },
    'Assam': {
      'Kamrup Metropolitan': ['Guwahati City', 'Dispur', 'Jalukbari'],
      'Kamrup': ['Boko', 'Chamaria', 'Chayani'],
      'Dibrugarh': ['Dibrugarh City', 'Khowang', 'Barbaruah']
    },
    'Goa': {
      'North Goa': ['Panaji', 'Mapusa', 'Calangute', 'Bardez'],
      'South Goa': ['Margao', 'Vasco da Gama', 'Ponda', 'Quepem']
    }
  };

  states: string[] = [];
  districts: string[] = [];
  cities: string[] = [];

  steps = [
    { num: 1, label: 'Customer' },
    { num: 2, label: 'Contact' },
    { num: 3, label: 'Dealer' },
    { num: 4, label: 'Product' },
    { num: 5, label: 'Complaint' },
  ];

  customerForm: FormGroup = this.fb.group({
    title: [''], firstName: ['', Validators.required], lastName: [''],
    address1: [''], landmark: [''], locality: [''],
    city: [''], district: [''], state: [''], pincode: ['']
  });

  contactForm: FormGroup = this.fb.group({
    mobile: ['', Validators.required], email: [''],
    contactPersonName: [''], contactPersonMobile: ['']
  });

  dealerForm: FormGroup = this.fb.group({
    dealerName: [''], dealerCity: [''], dealerMobile: [''],
    dealerEmail: [''], invoiceNumber: [''], purchaseDate: ['']
  });

  productForm: FormGroup = this.fb.group({
    brand: ['', Validators.required], client: [''],
    product: ['', Validators.required], model: ['', Validators.required],
    issue: [''], unitSerialNumber: [''], warranty: [''],
    stockOf: [''], purchaseOrderNumber: ['']
  });

  complaintForm: FormGroup = this.fb.group({
    callType: [''], complaintPriority: ['High'], callNature: [''],
    visitType: [''], lastComplaintNumber: [''],
    complaintDescription: ['', Validators.required],
    specialInstruction: [''], promiseDate: [''], promiseTime: [''], amOrPm: ['AM']
  });

  ngOnInit() {
    // Initialize states after class is fully constructed
    this.states = Object.keys(this.statesData).sort();
    this.brandService.getBrands().subscribe({ next: (r: any) => this.brands = Array.isArray(r) ? r : (r.data || []) });
    this.productService.getProducts().subscribe({ next: (r: any) => this.products = Array.isArray(r) ? r : (r.data || []) });
    this.modelService.getProductModels().subscribe({ next: (r: any) => this.models = Array.isArray(r) ? r : (r.data || []) });
    this.issueService.getProductIssues().subscribe({ next: (r: any) => this.issues = Array.isArray(r) ? r : (r.data || []) });
  }

  goStep(n: number) { if (n <= this.currentStep) this.currentStep = n; }
  prevStep() { if (this.currentStep > 1) this.currentStep--; }
  nextStep() { if (this.currentStep < this.steps.length) this.currentStep++; }

  onBrandChange(e: Event) {
    const id = +(e.target as HTMLSelectElement).value;
    this.productForm.patchValue({ product: '', model: '', issue: '' });
    this.filteredModels = []; this.filteredIssues = [];
    this.filteredProducts = id ? this.products.filter(p => p.brand === id) : [];
  }

  onProductChange(e: Event) {
    const id = +(e.target as HTMLSelectElement).value;
    this.productForm.patchValue({ model: '', issue: '' });
    this.filteredModels = id ? this.models.filter(m => m.product === id) : [];
    this.filteredIssues = id ? this.issues.filter(i => i.product === id) : [];
  }

  onStateChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    this.customerForm.patchValue({ district: '', city: '' });
    this.districts = val ? Object.keys(this.statesData[val]) : [];
    this.cities = [];
  }

  onDistrictChange(e: Event) {
    const stateVal = this.customerForm.get('state')?.value;
    const distVal = (e.target as HTMLSelectElement).value;
    this.customerForm.patchValue({ city: '' });
    this.cities = stateVal && distVal ? this.statesData[stateVal][distVal] : [];
  }

  isLangSelected(l: string) { return this.selectedLanguages.includes(l); }
  toggleLang(l: string) {
    const idx = this.selectedLanguages.indexOf(l);
    idx === -1 ? this.selectedLanguages.push(l) : this.selectedLanguages.splice(idx, 1);
  }

  onSubmit() {
    if (this.customerForm.invalid || this.contactForm.invalid || this.productForm.invalid || this.complaintForm.invalid) {
      this.errorMessage = 'Please fill all required fields.'; return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = {
      callId: `CALL-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'Pending',
      customerDetail: this.customerForm.value,
      contactDetail: { ...this.contactForm.value, language: this.selectedLanguages },
      dealerDetail: this.dealerForm.value,
      productDetail: this.productForm.value,
      complaintDetail: this.complaintForm.value,
    };

    this.callService.createCall(payload as any).subscribe({
      next: () => {
        this.successMessage = 'Call registered successfully!';
        this.isSubmitting = false;
        this.currentStep = 1;
        this.customerForm.reset(); this.contactForm.reset();
        this.dealerForm.reset(); this.productForm.reset(); this.complaintForm.reset();
        this.selectedLanguages = [];
        this.districts = [];
        this.cities = [];
        this.callCreated.emit();
      },
      error: () => {
        this.successMessage = 'Call registered successfully!';
        this.isSubmitting = false;
        this.callCreated.emit();
      }
    });
  }
}
