import fitz  # PyMuPDF
from datetime import datetime
import json

# Path to the fillable PDF
input_pdf_path = r"C:\Users\prade\OneDrive\Desktop\KNCET-Admission-Form\src\assets\admission-form-template.pdf"
# Generate unique filename with timestamp to avoid file lock issues
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
output_pdf_path = rf"C:\Users\prade\Downloads\nitro-updated_{timestamp}.pdf"
fields_output_path = rf"C:\Users\prade\Downloads\pdf-fields-collection_{timestamp}.json"

print("Opening PDF and collecting form fields...\n")

try:
    # Open the PDF
    pdf_document = fitz.open(input_pdf_path)
    
    # Collections for different field types
    text_fields = []
    checkboxes = []
    radio_buttons = []
    all_fields = []
    
    # Iterate through all pages in the PDF
    total_pages = len(pdf_document)
    print(f"PDF has {total_pages} page(s)\n")
    
    for page_num in range(total_pages):
        page = pdf_document[page_num]
        widgets = list(page.widgets())  # Convert generator to list
        
        if widgets:
            print(f"Page {page_num + 1}: Found {len(widgets)} widgets")
        else:
            print(f"Page {page_num + 1}: No form fields found")
            continue
        
        for widget in widgets:
            field_data = {
                'field_name': widget.field_name,
                'field_type': widget.field_type,
                'field_value': widget.field_value,
                'page': page_num + 1
            }
            
            # Text Field (Type 7)
            if widget.field_type == 7:
                text_fields.append({
                    'name': widget.field_name,
                    'current_value': widget.field_value or '',
                    'page': page_num + 1
                })
                print(f"✓ Text Field: {widget.field_name} (Page {page_num + 1})")
            
            # Checkbox (Type 2)
            elif widget.field_type == 2:
                states = widget.button_states()
                export_value = None
                
                if states and 'normal' in states:
                    on_values = states['normal']
                    if on_values and len(on_values) > 0:
                        export_value = on_values[0]
                
                checkboxes.append({
                    'name': widget.field_name,
                    'export_value': export_value,
                    'states': str(states),
                    'current_checked': bool(widget.field_value),
                    'page': page_num + 1
                })
                print(f"✓ Checkbox: {widget.field_name}, Export Value: {export_value} (Page {page_num + 1})")
            
            # Radio Button (Type 5)
            elif widget.field_type == 5:
                button_state = widget.button_states()
                radio_buttons.append({
                    'name': widget.field_name,
                    'button_state': str(button_state),
                    'current_value': widget.field_value,
                    'page': page_num + 1
                })
                print(f"✓ Radio Button: {widget.field_name} (Page {page_num + 1})")
            
            all_fields.append(field_data)
    print(f"   Radio Buttons: {len(radio_buttons)}")
    print("="*80 + "\n")
    
    # Create collection output
    field_collection = {
        'collection_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        'pdf_file': input_pdf_path,
        'summary': {
            'total_fields': len(all_fields),
            'text_fields_count': len(text_fields),
            'checkboxes_count': len(checkboxes),
            'radio_buttons_count': len(radio_buttons)
        },
        'text_fields': text_fields,
        'checkboxes': checkboxes,
        'radio_buttons': radio_buttons
    }
    
    # Save to JSON file
    with open(fields_output_path, 'w', encoding='utf-8') as f:
        json.dump(field_collection, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Field collection saved to: {fields_output_path}\n")
    
    # Display categorized lists
    print("📝 TEXT FIELDS LIST:")
    print("-" * 80)
    for tf in text_fields:
        print(f"   '{tf['name']}'")
    
    print("\n☑️  CHECKBOXES LIST:")
    print("-" * 80)
    for cb in checkboxes:
        print(f"   '{cb['name']}' (export: {cb['export_value']})")
    
    if radio_buttons:
        print("\n🔘 RADIO BUTTONS LIST:")
        print("-" * 80)
        for rb in radio_buttons:
            print(f"   '{rb['name']}'")
    
    print("\n" + "="*80)
    
    print("\n" + "="*80)
    print("\n🔄 Now filling PDF form with sample data...\n")
    
    # Sample student data
    student_data = {
        # Basic Information
        'name': 'Jpradeepgergere',
        'admission-id': '26KNF0005',
        'date': '05-01-2026',
        'date-of-birth': '15-05-2007',
        'branch-awarded': 'CSE',
        
        # Family Details
        'father/guardian-name': 'Mr. Doe',
        'father/guardian-occupation': 'Engineer',
        'family-income': '3,50,000',
        'caste': 'BC',
        
        # Address Details
        'address-line-1': '123 Main Street, Green Park',
        'address-line-2': 'Near City Center, Ward 5',
        'taluk': 'Erode',
        'district': 'Erode',
        'state': 'Tamil Nadu',
        'pin-code': '638109',
        
        # Contact Numbers
        'contact-No-(father)': '9876543210',
        'contact-No-(mother)': '9876543211',
        'contact-No-(student)': '9876543212',
        
        # Educational Background
        'name-and-place-of-college': 'Government Higher Secondary School, Erode',
        'register-no': 'REG2024001',
        'type-studies': 'HSC',
        'medium-of-study': 'English',
        'year-of-passing': '2024',
        
        # HSC/CBSE Marks
        'tamil': '95',
        'english': '92',
        'physics': '98',
        'chemistry': '96',
        'maths': '99',
        'computer-science/biology': '97',
        'hsc-total-mark': '577',
        'hsc-mark-percentage': '96.17',
        'engineering-eligibility': '198.5',
        'cutoff': '198.5',
        
        # SSLC Marks
        'sslc-mark': '475',
        'sslc-percentage': '95.00',
        
        # Diploma Fields (if applicable)
        'diploma-1-to-5-sem': '85.5',
        'diploma-1-to-6-sem': '87.2',
        
        # Transportation
        'bus-stop': 'Central Bus Stand',
        
        # Reference Information
        'know-about-this-college': 'Through School Counselor and College Website',
        'reference-name': 'Mr. Kumar',
        'reference-contact-no': '9876543213',
        
        # === GOVERNMENT QUOTA FEE STRUCTURE ===
        'government-tuition-fee': '35,000',
        'government-development-fee': '10,000',
        'government-admission-fee': '5,000',
        'government-caution deposit-fee': '3,000',
        'government-optional-fee': '7,000',
        'government-tuition-total-fee': '60,000',
        
        # Government Scholarships
        'government-sc/st-scholorship': '0',
        'government-first-graduate-fee': '5,000',
        
        # Government Transportation & Hostel
        'government-bus-fee': '12,000',
        'government-mess-bill': '45,000',
        'government-room-rent': '15,000',
        'government-laundry-fee': '3,000',
        
        # Government Totals
        'government-college-total-fee': '67,000',
        'government-total-hostel-fee': '63,000',
        'government-overall-fee': '1,30,000',
        
        # === MANAGEMENT QUOTA FEE STRUCTURE ===
        'management-tuition-fee': '85,000',
        'management-development-fee': '15,000',
        'management-admission-fee': '10,000',
        'management-caution deposit-fee': '5,000',
        'management-optional-fee': '10,000',
        'management-tuition-total-fee': '1,25,000',
        
        # Management Scholarships
        'management-sc/st-scholarship': '0',
        'management-first-graduate-fee': '5,000',
        
        # Management Transportation & Hostel
        'management-bus-fee': '15,000',
        'management-mess-bill': '50,000',
        'management-room-rent': '20,000',
        'management-laundry-fee': '4,000',
        
        # Management Totals
        'management-college-total-fee': '1,35,000',
        'management-total-hostel-fee': '74,000',
        'management-overall-fee': '2,09,000'
    }
    
    # Checkbox data (field_name: export_value)
    checkbox_data = {
        'gender': 'male',
        'admission-type': 'I-year',
        'community': 'BC',  # Changed to uppercase to match PDF
        'seat-type': 'governement',  # Matches PDF template typo
        'govt-eligible': 'yes',
        'first-graduate': 'yes',
        'student-type': 'college-bus'
    }
    
    # Department checkboxes to check (3 preferences)
    selected_depts = ['cse-dept', 'it-dept', 'ad-dept']
    
    # Fill text fields
    print("Setting text fields...")
    for page_num in range(len(pdf_document)):
        page = pdf_document[page_num]
        for widget in page.widgets():
            if widget.field_type == 7:  # Text field
                field_name = widget.field_name
                if field_name in student_data:
                    try:
                        widget.field_value = student_data[field_name]
                        widget.update()
                        print(f"✓ Set '{field_name}' = '{student_data[field_name]}' (Page {page_num + 1})")
                    except Exception as e:
                        print(f"✗ Failed to set {field_name}: {e}")
    
    print("\nSetting checkboxes...")
    checked_count = 0
    
    # Check department checkboxes (simple checkboxes)
    for page_num in range(len(pdf_document)):
        page = pdf_document[page_num]
        for widget in page.widgets():
            if widget.field_type == 2 and widget.field_name in selected_depts:
                try:
                    widget.field_value = True
                    widget.update()
                    checked_count += 1
                    print(f"✓ Checked department '{widget.field_name}' (Page {page_num + 1})")
                except Exception as e:
                    print(f"✗ Failed to check {widget.field_name}: {e}")
    
    # Check radio-style checkboxes (checkbox groups)
    for page_num in range(len(pdf_document)):
        page = pdf_document[page_num]
        for widget in page.widgets():
            if widget.field_type == 2:
                states = widget.button_states()
                if states and 'normal' in states:
                    on_values = states['normal']
                    if on_values and len(on_values) > 0:
                        export_value = on_values[0]
                        
                        # Check if this widget matches our checkbox data
                        for field_name, target_value in checkbox_data.items():
                            if widget.field_name == field_name and export_value == target_value:
                                try:
                                    widget.field_value = True
                                    widget.update()
                                    checked_count += 1
                                    print(f"✓ Checked '{field_name}' = '{target_value}' (Page {page_num + 1})")
                                except Exception as e:
                                    print(f"✗ Failed to check {field_name}: {e}")
    
    print(f"\nTotal checkboxes checked: {checked_count}")
    
    # Save the updated PDF
    pdf_document.save(output_pdf_path, incremental=False, encryption=fitz.PDF_ENCRYPT_KEEP)
    pdf_document.close()
    
    print(f"\n✅ PDF successfully updated!")
    print(f"📄 Output saved to: {output_pdf_path}")
    print(f"\n📝 Updated fields:")
    print(f"   - Text fields: {len([k for k in student_data.keys()])} fields filled")
    print(f"   - Checkboxes: {checked_count} checkboxes checked")
    print(f"   - Departments: {', '.join(selected_depts)}")
    print(f"\n💡 Please open the PDF to verify all data is filled correctly.")
    
except FileNotFoundError:
    print(f"❌ Error: PDF file not found at {input_pdf_path}")
    print("Please check the file path and try again.")
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
