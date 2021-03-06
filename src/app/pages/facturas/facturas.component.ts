import { Component, OnInit } from '@angular/core';
import { Factura } from '../../models/factura.model';
import { ClienteService } from '../../services/cliente/cliente.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith } from 'rxjs/internal/operators/startWith';
import { map } from 'rxjs/internal/operators/map';
import { FacturaService } from '../../services/facturas/factura.service';
import { Producto } from '../../models/producto';
import { flatMap } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { ItemFactura } from '../../models/item-factura';
import swal from 'sweetalert';

@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css']
})
export class FacturasComponent implements OnInit {

  titulo: string = 'Nueva Factura';
  factura: Factura = new Factura();

  myControl = new FormControl();
  options: string[] = ['Tablet', 'Laptop', 'PC'];
  filteredOptions: Observable<Producto[]>;

  constructor(private clienteService: ClienteService,
              private activatedRoute: ActivatedRoute,
              private facturaService: FacturaService,
              private router: Router) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      // con el mas convertimos a un tipo number
    let clienteId = +params.get('clienteId');
    this.clienteService.getCliente(clienteId).subscribe(cliente => {
    this.factura.cliente = cliente;
      });
    });
    this.filteredOptions = this.myControl.valueChanges
    .pipe(
      // startWith(''),
      // map(value => this._filter(value))
      map(value => typeof value === 'string' ? value : value.nombre),
      flatMap(value => value ? this._filter(value) : [])
    );
  }

  private _filter(value: string): Observable<Producto[]> {
    const filterValue = value.toLowerCase();
    return this.facturaService.buscarProductos(filterValue);
    // return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }
  mostrarNombre( producto?: Producto ): string | undefined {
    return producto ? producto.nombre : undefined;

  }
  seleccionarProducto(event: MatAutocompleteSelectedEvent): void {
    let producto = event.option.value as Producto;
    console.log(producto);

    if (this.existeItem(producto.id)) {
      this.incrementaCantidad(producto.id);
    } else {

      let nuevoItem = new ItemFactura();
      nuevoItem.producto = producto;
      this.factura.items.push(nuevoItem);

    }
    this.myControl.setValue('');
    event.option.focus();
    event.option.deselect();
  }
  actualizarCantidad(id: number, event: any): void {
    let cantidad: number = event.target.value as number;

    if (cantidad == 0) {
      return this.eliminarItemFactura(id);
    }


    this.factura.items = this.factura.items.map((item: ItemFactura) => {
      if (id === item.producto.id) {
        item.cantidad = cantidad;
      }
      return item;
    });

  }
  existeItem(id: number): boolean {
    let existe = false;
    this.factura.items.forEach((item: ItemFactura) => {
      if (id === item.producto.id) {
       existe = true;
      }
    });
    return existe;
  }
  incrementaCantidad(id: number): void {
    this.factura.items = this.factura.items.map((item: ItemFactura) => {
      if (id === item.producto.id) {
        ++item.cantidad;
      }
      return item;
    });

  }
  eliminarItemFactura(id: number): void {
    this.factura.items = this.factura.items.filter((item: ItemFactura) => id !== item.producto.id);
  }
  create(): void {
    this.facturaService.create(this.factura).subscribe(factura => {
      swal('Factura Creada', 'exito', 'success');
      this.router.navigate(['/clientes']);
    });
  }
}
