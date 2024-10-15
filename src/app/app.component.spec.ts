import { ComponentFixture, flush, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { fakeAsync, tick } from '@angular/core/testing';
import { errors } from './constants'

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, AppComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should bind name and age input fields', () => {
    const nameInput = fixture.nativeElement.querySelector('input[placeholder="Enter name"]');
    const ageInput = fixture.nativeElement.querySelector('input[placeholder="Enter age"]');
    nameInput.value = 'John Doe';
    nameInput.dispatchEvent(new Event('input'));
    ageInput.value = '30';
    ageInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(nameInput.value).toBe('John Doe');
    expect(ageInput.value).toBe('30');
  });

  it('should display message when record is added', () => {
    component.message = 'Record added successfully';
    fixture.detectChanges();
    const messageDiv = fixture.nativeElement.querySelector('.message');
    expect(messageDiv).toBeTruthy();
    expect(messageDiv.textContent).toContain('Record added successfully');
  });

  it('should display records correctly', () => {
    component.records = [{ name: 'Alice', age: 25 }, { name: 'Bob', age: 30 }];
    fixture.detectChanges();
    const recordElements = fixture.nativeElement.querySelectorAll('.timeline .item');
    expect(recordElements.length).toBe(2);
    expect(recordElements[0].textContent).toContain('Name: Alice, Age: 25');
    expect(recordElements[1].textContent).toContain('Name: Bob, Age: 30');
  });

  it('should display error message when validation fails', () => {
    component.name = '';
    component.age = 0;
    component.addEvent();
    fixture.detectChanges();
    const messageElement = fixture.nativeElement.querySelector('.message');
    expect(messageElement).toBeTruthy();
    expect(messageElement.textContent).toContain(errors.nullValue);
  });

  it('should display error message when validation fails', () => {
    component.name = 'John Doe';
    component.age = -1;
    component.addEvent();
    fixture.detectChanges();
    const messageElement = fixture.nativeElement.querySelector('.message');
    expect(messageElement).toBeTruthy();
    expect(messageElement.textContent).toContain(errors.ageLimit);
  });

  it('should call sendJson and display loading when submit is clicked', () => {
    const spy = spyOn(component, 'sendJson').and.callThrough();
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response('{"success": true}')));
    component.name = 'John';
    component.age = 25;
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(spy).toHaveBeenCalledWith('John', 25);
    expect(component.submitLoading).toBeTrue();
  });

  it('should retrieve and display records when "Retrieve Files" is clicked', fakeAsync(() => {
    const mockResponse = [{ name: 'John', age: 25 }];
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response(JSON.stringify(mockResponse))));
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const retrieveButton = buttons[1];
    retrieveButton.click();
    fixture.detectChanges();
    tick(); 
    flush();
    const recordsList = fixture.nativeElement.querySelector('.record');
    expect(recordsList).toBeTruthy();
  }));
});
