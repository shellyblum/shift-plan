import {MatDialog} from '@angular/material/dialog';
import { AfterViewInit, Component, OnInit, Output, EventEmitter } from '@angular/core';
import { defaults as defaultControls } from 'ol/control';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import ZoomToExtent from 'ol/control/ZoomToExtent';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import {Vector as VectorLayer} from 'ol/layer';
import Overlay from 'ol/Overlay';
import TileJSON from 'ol/source/TileJSON';
import {Icon, Style} from 'ol/style';
import 'ol/ol.css';
import {toLonLat} from 'ol/proj';
import {toStringHDMS} from 'ol/coordinate';

@Component({
  selector: 'app-map-dialog',
  templateUrl: './map-dialog.component.html',
  styleUrls: ['./map-dialog.component.css']
})
export class MapDialogComponent {
  @Output() location = new EventEmitter<string>();
  @Output() coordinates = new EventEmitter();

  constructor(public dialog: MatDialog) {}
  // address: string;
  flag = false;
  // ngOnInit(): void {
    // this.address = "usa 123 lt space"
  // }
  closeDialog() {
    this.dialog.closeAll();
  }
  openDialog() {
    const dialogRef = this.dialog.open(DialogContentExampleDialog);
    dialogRef.afterClosed().subscribe(result => {
      this.flag = true;
      this.location.emit(result);
      this.coordinates.emit(this.coordinates);
    });
  }
}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: 'dialog-content-example-dialog.html',
  styleUrls: ['./map-dialog.component.css']

})
export class DialogContentExampleDialog implements AfterViewInit{
  map: Map;
  vectorLayer: any;
  rasterLayer: any;
  placeName: any;
  @Output() location = new EventEmitter<string>();
  @Output() coordinates = new EventEmitter();


  ngAfterViewInit() {
    this.showMap();
  }

 approveLocation()
  {
    //do code for approve button
  }

  //getting place name
  getPlaceName(lon, lat) {
    var content = document.getElementById('popup-content');
    fetch('https://nominatim.openstreetmap.org/reverse?format=json&lon=' + lon + '&lat=' + lat)
      .then((response) => {
        return response.json();
      }).then((json) => {
        content.innerHTML = '<code>' + json.display_name + '</code>';
        this.location = this.placeName = json.display_name;
        // this.coordinates = {lon: lon, lat: lat};
        // this.coordinates.emit({lon: lon, lat: lat});

    });
  }

  showMap() {
    var container = document.getElementById('popup');
    var closer = document.getElementById('popup-closer');
    /**
     * Create an overlay to anchor the popup to the map.
     */
    var overlay = new Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });
    /**
     * Add a click handler to hide the popup.
     * @return {boolean} Don't follow the href.
     */
    closer.onclick = function () {
      overlay.setPosition(undefined);
      closer.blur();
      return false;
    };

    /**
     * Create the map.
     */
    var map = new Map({
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
            tileSize: 512,
          }),
        }) ],
      overlays: [overlay],
      target: 'map',
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    /**
     * Add a click handler to the map to render the popup.
     */
    map.on('singleclick', (evt) => {
      var coordinate = evt.coordinate;
      overlay.setPosition(coordinate);
      var coordinate = toLonLat(evt.coordinate).map(function(val) {
        return val.toFixed(6);
      });
      var lon = coordinate[0];
      var lat = coordinate[1];
      // this.coordinates = {lon: lon, lat: lat};
      this.getPlaceName(lon, lat);
    });
  }

}
