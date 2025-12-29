import fitz  # PyMuPDF

# Path to the fillable PDF
input_pdf_path = r"C:\Users\prade\OneDrive\Desktop\KNCETform-sheet-serverless\KNCETform_frontend-main\src\assets\admission-form-template.pdf"
output_pdf_path = r"C:\Users\prade\Downloads\Sedji-fillable-updated.pdf"

print("Opening PDF and inspecting form fields...\n")

try:
    # Open the PDF
    pdf_document = fitz.open(input_pdf_path)
    
    # Get the first page (assuming form is on first page)
    page = pdf_document[0]
    
    # Get all form fields (widgets)
    widgets = page.widgets()
    
    print("Available form fields:")
    print("="*80)
    for widget in widgets:
        field_info = f"   Field: {widget.field_name}, Type: {widget.field_type}, Value: {widget.field_value}"
        
        # For radio buttons (Type 5), show the button state/option
        if widget.field_type == 5:  # Radio button
            button_state = widget.button_states()
            field_info += f", Button State: {button_state}"
        
        # For checkboxes (Type 2), show checked/unchecked and export value
        elif widget.field_type == 2:  # Checkbox
            is_checked = widget.field_value
            field_info += f", Checked: {bool(is_checked)}"
            # Try to get export value
            try:
                on_state = widget.button_states()
                field_info += f", States: {on_state}"
            except:
                pass
        
        print(field_info)
    
    print("\n" + "="*80)
    print("\nField Type Legend:")
    print("  Type 2 = Checkbox (True/False)")
    print("  Type 5 = Radio Button (multiple options)")
    print("  Type 7 = Text Field (string input)")
    print("="*80 + "\n")
    
    # Now test setting specific checkboxes and text fields
    print("Filling PDF form with sample data...\n")
    
    # Sample student data
    student_data = {
        # Text fields
        'name': 'John Doe',
        'adminssion-id': 'ADM2025001',
        'date': '28-12-2025',
        'date-of-birth': '15-05-2007',
        'address-line-1': '123 Main Street',
        'address-line-2': 'Near City Center',
        'taluk': 'Sample Taluk',
        'district': 'Sample District',
        'state': 'Tamil Nadu',
        'pin-code': '600001',
        'contact-No-(father)': '9876543210',
        'contact-No-(mother)': '9876543211',
        'contact-No-(student)': '9876543212',
        'father/guardian-name': 'Mr. Doe',
        'father/guardian-occupation': 'Engineer',
        'family-income': '500000',
        'caste': 'BC',
        'name-and-place-of-college': 'XYZ Higher Secondary School, Chennai',
        'register-no': 'REG2024001',
        'type-studies': 'HSC',
        'medium-of-study': 'English',
        'year-of-passing': '2024',
        'tamil': '95',
        'english': '92',
        'physics': '98',
        'chemistry': '96',
        'maths': '99',
        'computer-science/biology': '97',
        'total-mark': '577',
        'cutoff': '198.5',
        'mark-percentage': '96.17',
        'branch-awarded': 'CSE',
        'bus-stop': 'Central Bus Stand',
        'know-about-this-college': 'Through School Counselor',
        'reference-name': 'Mr. Reference',
        'reference-contact': '9876543213'
    }
    
    # Checkbox data (field_name: export_value)
    checkbox_data = {
        'gender': 'male',
        'admission-type': 'I-year',
        'community': 'bc',
        'govt-eligible': 'no',
        'first-graduate': 'no',
        'student-type': 'college-bus'
    }
    
    # Department checkboxes to check (3 preferences)
    selected_depts = ['cse-dept', 'it-dept', 'ad-dept']
    
    # Fill text fields
    print("Setting text fields...")
    for widget in page.widgets():
        if widget.field_type == 7:  # Text field
            field_name = widget.field_name
            if field_name in student_data:
                try:
                    widget.field_value = student_data[field_name]
                    widget.update()
                    print(f"✓ Set '{field_name}' = '{student_data[field_name]}'")
                except Exception as e:
                    print(f"✗ Failed to set {field_name}: {e}")
    
    print("\nSetting checkboxes...")
    checked_count = 0
    
    # Check department checkboxes (simple checkboxes)
    for widget in page.widgets():
        if widget.field_type == 2 and widget.field_name in selected_depts:
            try:
                widget.field_value = True
                widget.update()
                checked_count += 1
                print(f"✓ Checked department '{widget.field_name}'")
            except Exception as e:
                print(f"✗ Failed to check {widget.field_name}: {e}")
    
    # Check radio-style checkboxes (checkbox groups)
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
                                print(f"✓ Checked '{field_name}' = '{target_value}'")
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
