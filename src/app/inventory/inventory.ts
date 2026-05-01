import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory implements OnInit {

  products: any[] = [];
  categories: any[] = [];
  totalItems: number = 0;
  lowStockCount: number = 0;
  error: string = '';
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  toast: string = '';
  toastType: string = '';
  showDropdown: boolean = false;

  showAddModal: boolean = false;
  newProduct = {
    name: '',
    sku: '',
    description: '',
    sellingPrice: 0,
    reorderThreshold: 10,
    categoryId: null as any
  };

  showEditModal: boolean = false;
  editProduct: any = null;

  showBatchModal: boolean = false;
  newBatch = {
    productSku: '',
    productName: '',
    productDescription: '',
    categoryName: '',
    categoryDescription: '',
    purchaseOrderId: '',
    quantity: 0,
    costPrice: 0,
    sellingPrice: 0,
    expiryDate: '',
    notes: ''
  };

  showImportModal: boolean = false;
  importType: string = 'excel';
  importFile: File | null = null;
  importing: boolean = false;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.productService.getAllProducts(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.products = [...response.content];
        this.totalItems = response.totalElements;
        this.totalPages = response.totalPages;
        this.lowStockCount = this.products.filter(p => p.isLowStock).length;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load products';
        this.cdr.detectChanges();
      }
    });
  }

  loadCategories(): void {
    this.productService.getCategoryList().subscribe({
      next: (response) => {
        this.categories = response;
        this.cdr.detectChanges();
      },
      error: () => console.log('Failed to load categories')
    });
  }

  showToast(message: string, type: string): void {
    this.toast = message;
    this.toastType = type;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toast = '';
      this.toastType = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    this.cdr.detectChanges();
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  openAddModal(): void {
    this.showDropdown = false;
    this.showAddModal = true;
    this.cdr.detectChanges();
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newProduct = {
      name: '', sku: '', description: '',
      sellingPrice: 0, reorderThreshold: 10, categoryId: null
    };
    this.cdr.detectChanges();
  }

  addProduct(): void {
    this.productService.createProduct(this.newProduct).subscribe({
      next: () => {
        this.closeAddModal();
        this.loadProducts();
        this.showToast('Product added successfully!', 'success');
      },
      error: () => this.showToast('Failed to add product', 'error')
    });
  }

  openEditModal(product: any): void {
    this.editProduct = { ...product };
    this.showEditModal = true;
    this.cdr.detectChanges();
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editProduct = null;
    this.cdr.detectChanges();
  }

  saveEditProduct(): void {
    this.productService.updateProduct(this.editProduct.id, {
      name: this.editProduct.name,
      sku: this.editProduct.sku,
      description: this.editProduct.description,
      sellingPrice: this.editProduct.sellingPrice,
      reorderThreshold: this.editProduct.reorderThreshold,
      categoryId: this.editProduct.categoryId
    }).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadProducts();
        this.showToast('Product updated successfully!', 'success');
      },
      error: () => this.showToast('Failed to update product', 'error')
    });
  }

  openBatchModal(): void {
    this.showDropdown = false;
    this.showBatchModal = true;
    this.cdr.detectChanges();
  }

  closeBatchModal(): void {
    this.showBatchModal = false;
    this.newBatch = {
      productSku: '', productName: '', productDescription: '',
      categoryName: '', categoryDescription: '',
      purchaseOrderId: '', quantity: 0, costPrice: 0,
      sellingPrice: 0, expiryDate: '', notes: ''
    };
    this.cdr.detectChanges();
  }

  receiveStock(): void {
    const payload: any = {
      productSku: this.newBatch.productSku || null,
      productName: this.newBatch.productName || null,
      productDescription: this.newBatch.productDescription || null,
      categoryName: this.newBatch.categoryName,
      categoryDescription: this.newBatch.categoryDescription || null,
      purchaseOrderId: this.newBatch.purchaseOrderId || null,
      quantity: this.newBatch.quantity,
      costPrice: this.newBatch.costPrice,
      sellingPrice: this.newBatch.sellingPrice,
      notes: this.newBatch.notes || null,
      expiryDate: this.newBatch.expiryDate || null
    };

    this.productService.receiveBatch(payload).subscribe({
      next: () => {
        this.closeBatchModal();
        this.loadProducts();
        this.showToast('Stock received successfully!', 'success');
      },
      error: () => this.showToast('Failed to receive stock', 'error')
    });
  }

  openImportModal(type: string): void {
    this.showDropdown = false;
    this.importType = type;
    this.showImportModal = true;
    this.cdr.detectChanges();
  }

  closeImportModal(): void {
    this.showImportModal = false;
    this.importFile = null;
    this.importing = false;
    this.cdr.detectChanges();
  }

  onFileSelected(event: any): void {
    this.importFile = event.target.files[0];
  }

  importFile_(): void {
    if (!this.importFile) {
      this.showToast('Please select a file first', 'error');
      return;
    }
    this.importing = true;
    const call = this.importType === 'excel'
      ? this.productService.importFromExcel(this.importFile)
      : this.productService.importFromCSV(this.importFile);

    call.subscribe({
      next: (response) => {
        this.closeImportModal();
        this.loadProducts();
        this.showToast(`Import done! ${response.successCount} batches imported`, 'success');
      },
      error: () => {
        this.importing = false;
        this.showToast('Import failed', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts();
          this.showToast('Product deleted!', 'success');
        },
        error: () => this.showToast('Failed to delete product', 'error')
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getStockStatus(product: any): string {
    if (product.totalQuantity === 0) return 'out-of-stock';
    if (product.isLowStock) return 'low-stock';
    return 'in-stock';
  }

  getStockLabel(product: any): string {
    if (product.totalQuantity === 0) return 'Out of Stock';
    if (product.isLowStock) return 'Low Stock';
    return 'In Stock';
  }

  formatPrice(value: number): string {
    return value ? Number(value).toFixed(2) : '0.00';
  }
}