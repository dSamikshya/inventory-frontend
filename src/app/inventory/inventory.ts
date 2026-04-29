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
  totalItems: number = 0;
  lowStockCount: number = 0;
  error: string = '';
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  showAddModal: boolean = false;
  toast: string = '';
  toastType: string = '';
  showEditModal: boolean = false;
editProduct: any = null;
  newProduct = {
    name: '',
    sku: '',
    description: '',
    sellingPrice: 0,
    reorderThreshold: 10,
    categoryId: null
  };

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAllProducts(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.products = [...response.content];
        this.totalItems = response.totalElements;
        this.totalPages = response.totalPages;
        this.lowStockCount = this.products.filter(p => p.totalQuantity <= p.reorderThreshold).length;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load products';
        this.cdr.detectChanges();
      }
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

  openAddModal(): void {
    this.showAddModal = true;
    this.cdr.detectChanges();
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newProduct = {
      name: '',
      sku: '',
      description: '',
      sellingPrice: 0,
      reorderThreshold: 10,
      categoryId: null
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
      error: () => {
        this.showToast('Failed to add product', 'error');
      }
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
    error: () => {
      this.showToast('Failed to update product', 'error');
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
    if (product.totalQuantity <= product.reorderThreshold) return 'low-stock';
    return 'in-stock';
  }

  getStockLabel(product: any): string {
    if (product.totalQuantity === 0) return 'Out of Stock';
    if (product.totalQuantity <= product.reorderThreshold) return 'Low Stock';
    return 'In Stock';
  }
}