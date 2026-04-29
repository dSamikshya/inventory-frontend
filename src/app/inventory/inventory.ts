import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../services/product';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule],
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
      error: (err) => {
        this.error = 'Failed to load products';
        this.cdr.detectChanges();
      }
    });
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => this.loadProducts(),
        error: () => this.error = 'Failed to delete product'
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