import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { PanGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { Image } from 'ui/image';
import { GridLayout } from 'ui/layouts/grid-layout';
import { AnimationCurve } from 'ui/enums';

import { Item } from './item';
import { ItemService } from './item.service';

enum panStates {
  down = 1,
  panning = 2,
  up = 3,
}
@Component({
  selector: 'ns-details',
  moduleId: module.id,
  templateUrl: './item-detail.component.html',
})
export class ItemDetailComponent implements OnInit {
  @ViewChild('dragImage') dragImage: ElementRef;
  @ViewChild('container') container: ElementRef;
  itemContainer: GridLayout;
  dragImageItem: Image;
  prevDeltaX: number;
  prevDeltaY: number;
  item: Item;

  constructor(
    private itemService: ItemService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getItemData();
    this.setImagePosition();
  }
  setImagePosition() {
    this.dragImageItem = <Image>this.dragImage.nativeElement;
    this.itemContainer = <GridLayout>this.container.nativeElement;
    this.dragImageItem.translateX = 0;
    this.dragImageItem.translateY = 0;
    this.dragImageItem.scaleX = 1;
    this.dragImageItem.scaleY = 1;
  }
  getItemData() {
    const id = +this.route.snapshot.params['id'];
    this.item = this.itemService.getItem(id);
  }
  onPan(args: PanGestureEventData) {
    if (args.state === panStates.down) {
      this.prevDeltaX = 0;
      this.prevDeltaY = 0;
    } else if ((args.state = panStates.panning)) {
      this.dragImageItem.translateX += args.deltaX - this.prevDeltaX;
      this.dragImageItem.translateY += args.deltaY - this.prevDeltaY;
      this.restrictBoundaries();
      this.prevDeltaX = args.deltaX;
      this.prevDeltaY = args.deltaY;
    } else if ((args.state = panStates.up)) {
      console.log('Up');
      this.dragImageItem.animate({
        translate: { x: 0, y: 0 },
        duration: 1000,
        curve: AnimationCurve.cubicBezier(0.1, 0.1, 0.1, 1),
      });
    }
  }
  restrictBoundaries() {
    // calculate the conversion from DP to pixels
    let convFactor =
      <number>this.dragImageItem.width / this.dragImageItem.getMeasuredWidth();
    let edgeX =
      (this.itemContainer.getMeasuredWidth() -
        this.dragImageItem.getMeasuredWidth()) *
      convFactor;
    let edgeY =
      (this.itemContainer.getMeasuredHeight() -
        this.dragImageItem.getMeasuredHeight()) *
      convFactor;

    // X border
    if (this.dragImageItem.translateX < 0) {
      this.dragImageItem.translateX = 0;
    } else if (this.dragImageItem.translateX > edgeX) {
      this.dragImageItem.translateX = edgeX;
    }

    // Y border
    if (this.dragImageItem.translateY < 0) {
      this.dragImageItem.translateY = 0;
    } else if (this.dragImageItem.translateY > edgeY) {
      this.dragImageItem.translateY = edgeY;
    }
  }
  reset($event) {
    [this.dragImageItem.translateX, this.dragImageItem.translateY] = [0, 0];
  }
}
