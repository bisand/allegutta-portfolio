import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioEditorComponent } from './portfolio-editor.component';

describe('PortfolioEditorComponent', () => {
  let component: PortfolioEditorComponent;
  let fixture: ComponentFixture<PortfolioEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
