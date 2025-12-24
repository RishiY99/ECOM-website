import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductServies } from '../../services/product-servies';
import { product } from '../../services/types';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  imports: [CommonModule, RouterLink],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search {
  searchresult: undefined | product[]
  NOsearchresult: string | undefined

  constructor(private activeroute: ActivatedRoute, private product: ProductServies, private crf: ChangeDetectorRef) { }

  ngOnInit(): void {
    let query = this.activeroute.snapshot.paramMap.get('query')
    if (query) {
      this.product.serachProducts(query).subscribe((res) => {
        this.searchresult = res
      })
    } else {
      this.NOsearchresult = "NO result Found"
    }
  }
}
