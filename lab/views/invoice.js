let invoice = null;
let invoicePreview = null;
const invoicePreviewElement = $('#invoice_preview');


function set_var(_var, value) {
    let r = document.querySelector(':root');
    // Set the value of variable --blue to another value (in this case "lightblue")
    r.style.setProperty(_var, value);
}

class Invoice {
    constructor() {
        $('#invoice_form').prepend(setInputsType(this.fields()));
    }

    getInvoice() {
        let invoice = run(`select * from lab_invoice where lab_hash = '${localStorage.getItem('lab_hash')}';`)?.result[0]?.query0[0];
        if (invoice == undefined) {
            // create new invoice
            // id, hash, lab_hash, color, phone_1, phone_2, address, facebook, logo, workers
            run({
                action: 'insert',
                table: 'lab_invoice',
                column: {
                    lab_hash: localStorage.getItem('lab_hash'),
                    color: '#6F8EFC',
                    font_color: '#000000',
                    phone_1: '',
                    phone_2: '',
                    address: '',
                    facebook: '',
                    water_mark: '',
                    logo: '',
                    name_in_invoice: localStorage.getItem('lab_name') ?? ''
                }
            })
            invoice = run(`select * from lab_invoice where lab_hash = '${localStorage.getItem('lab_hash')}';`)?.result[0]?.query0[0];
        }
        return invoice;
    }

    fields() {
        return [
            { name: 'name_in_invoice', type: 'text', label: 'اسم الفاتورة', req: 'required', size: "6" },
            { name: 'font_size', type: 'number', label: 'حجم الخط', req: 'required', size: "6" },
            { name: 'color', type: 'color', label: 'لون الفاتورة', req: 'required', size: "6" },
            { name: 'font_color', type: 'color', label: 'لون الخط', req: 'required', size: "6" },
            { name: 'doing_by', type: 'text', label: 'المسؤول عن الفاتورة', req: 'required', size: "6" },
            // { name: 'zoom', type: 'range', label: 'حجم الشاشة', req: 'max="160" min="50" value="100" step="10"' },
            { name: 'phone_1', type: 'text', label: 'رقم الهاتف', req: 'required', size: "6" },
            // {name:'phone_2', type:'text', label:'رقم الهاتف 2', req:'required'},
            { name: 'address', type: 'text', label: 'العنوان', req: 'required', size: "6" },
            { name: 'facebook', type: 'text', label: 'الايميل', req: 'required', size: "6" },
            { name: 'header', type: 'number', label: 'الرأس', req: 'required', size: "6" },
            { name: 'footer', type: 'number', label: 'الذيل', req: 'required', size: "6" },
            { name: 'center', type: 'number', label: 'المركز', req: 'disabled', size: "12" },
            { name: 'footer_header_show', type: 'checkbox', label: 'اظهار - اخفاء الفورمة', req: 'required', size: "6" },
            { name: 'water_mark', type: 'checkbox', label: 'اظهار واخفاء العلامة المائية', req: 'required', size: "6" },
            { name: 'invoice_about_ar', type: 'text', label: 'عنوان فاتورة الدفع(بالغة العربية)', req: '', size: "6" },
            { name: 'invoice_about_en', type: 'text', label: 'عنوان فاتورة الدفع(بالغة الانجليزية)', req: '', size: "6" },
            { name: 'logo', type: 'image', label: 'الشعار', req: 'required', size: "12" },
        ]
    }

    insertDataToForm() {
        let invoice = this.getInvoice();
        fillForm(`invoice_form`, this.fields(), invoice);
    }

    async updateInvoice() {
        if (!navigator.onLine) {
            Swal.fire({
                icon: 'error',
                title: 'خطأ',
                text: 'لا يوجد اتصال بالانترنت',
                confirmButtonText: 'موافق'
            }).then(() => {
                window.location.href = 'index.html';
            })
        }
        let token = localStorage.getItem('token');
        let invoice = getFormData(`invoice_form`, this.fields());
        run(`
            update lab_invoice set 
            color = '${invoice.color}', 
            font_color = '${invoice.font_color}', 
            name_in_invoice = '${invoice.name_in_invoice}',
            font_size = '${invoice.font_size}',
            doing_by = '${invoice.doing_by}',
            phone_1 = '${invoice.phone_1}', 
            phone_2 = '${invoice.phone_2}', 
            address = '${invoice.address}', 
            facebook = '${invoice.facebook}', 
            water_mark = '${invoice.water_mark}',
            header = '${invoice.header}',
            center = '${invoice.center}',
            footer = '${invoice.footer}',
            footer_header_show = '${invoice.footer_header_show}',
            invoice_about_ar = '${invoice.invoice_about_ar}',
            invoice_about_en = '${invoice.invoice_about_en}',
            logo = '${invoice.logo}'
            where lab_hash = '${localStorage.getItem('lab_hash')}';
        `
        );
        localStorage.setItem('token', token);
        setTimeout(() => {
            let file = window[`logo_preview`].cachedFileArray[0];
            let imageUrl = file ? uploadFileOnline(file, "logos", "logo").result[0] : false;
            file ? $(`#invoice_form [name=logo]`).val(imageUrl) : null;
            run_online(`
            update lab_invoice set 
            color = '${invoice.color}', 
            font_color = '${invoice.font_color}', 
            name_in_invoice = '${invoice.name_in_invoice}',
            font_size = '${invoice.font_size}',
            doing_by = '${invoice.doing_by}',
            phone_1 = '${invoice.phone_1}', 
            phone_2 = '${invoice.phone_2}', 
            address = '${invoice.address}', 
            facebook = '${invoice.facebook}', 
            water_mark = '${invoice.water_mark}',
            header = '${invoice.header}',
            center = '${invoice.center}',
            footer = '${invoice.footer}',
            footer_header_show = '${invoice.footer_header_show}',
            invoice_about_ar = '${invoice.invoice_about_ar}',
            invoice_about_en = '${invoice.invoice_about_en}'
            ${file ? `,logo = 'http://umc.native-code-iq.com/app/${imageUrl}'` : ``}
            where lab_hash = '${localStorage.getItem('lab_hash')}';
        `
            );
        }, 1000);
        localStorage.setItem('logo', invoice.logo);
        if (invoice && invoicePreviewElement) {
            setInvoicePreview(invoicePreviewElement, this.getInvoice());
        }
        Swal.fire({
            icon: 'success',
            title: 'تم',
            text: 'تم تعديل الفاتورة بنجاح',
            confirmButtonText: 'موافق'
        })
    }
}
// check internet connection
if (navigator.onLine) {
    invoice = new Invoice();
    //dom ready
    $(document).ready(function () {
        invoice.insertDataToForm();
        // set center + footer + header  =  1495
        $('input[name="header"]').on('change', function () {
            let header = $(this).val();
            let center = $('input[name="center"]').val();
            let footer = $('input[name="footer"]').val();
            let total = parseInt(header) + parseInt(center) + parseInt(footer);
            if (total > 1495) {
                // change center
                $('input[name="center"]').val(1495 - parseInt(header) - parseInt(footer));
            } else if (total < 1495) {
                // change center
                $('input[name="center"]').val(1495 - parseInt(header) - parseInt(footer));
            }
        });
        $('input[name="footer"]').on('change', function () {
            let header = $('input[name="header"]').val();
            let center = $('input[name="center"]').val();
            let footer = $(this).val();
            let total = parseInt(header) + parseInt(center) + parseInt(footer);
            if (total > 1495) {
                // change center
                $('input[name="center"]').val(1495 - parseInt(header) - parseInt(footer));
            } else if (total < 1495) {
                // change center
                $('input[name="center"]').val(1495 - parseInt(header) - parseInt(footer));
            }
        });
    });
} else {
    Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: 'لا يوجد اتصال بالانترنت',

    }).then(() => {
        window.location.href = 'index.html';
    })
}

// dom ready
$(document).ready(function () {
    if (invoice && invoicePreviewElement) {
        setInvoicePreview(invoicePreviewElement, invoice.getInvoice());
    }
});

const setInvoicePreview = (invoicePreviewElement, invoiceObj) => {
    if (!invoiceObj) return null;
    let {
        color,
        font_color,
        name_in_invoice,
        font_size,
        phone_1,
        address,
        facebook,
        water_mark,
        header,
        center,
        footer,
        footer_header_show,
        logo
    } = invoiceObj;

    set_var('--font_size', `${font_size ?? 20}px`);
    set_var('--typeTest-font', `${(parseInt(font_size) + 2) ?? 20}px`);
    set_var('--color-orange', color ?? '#ff8800');
    set_var('--invoice-color', font_color ?? '#000');
    set_var('--logo-height', `${header ?? 175}px`);
    let invoiceBody = `<div class="book-result" dir="ltr" id="invoice-normalTests" style=""><div class="page">
    <!-- صفحة يمكنك تكرارها -->
    
    <div class="header" style="height: ${header}px;">
        <div class="row justify-content-around" style="display: ${footer_header_show == '1' ? '' : 'none'};">
            <div class="logo col-4 p-2">
                <!-- شعار التحليل -->
                <img src="${logo}" alt="logo">
            </div>
            <div class="logo justify-content-end col-4 p-2">
                <!-- شعار التحليل -->
                <h2 class="navbar-brand-name text-center">${name_in_invoice}</h2>
            </div>
        </div>
    </div>
    
    <div class="center2" style="border-top: 5px solid rgb(46, 63, 76); height: ${center}px;">
        <div class="center2-background" style="${water_mark == '1' ? `background-image: url(&quot;${logo}&quot;);` : 'display:none;'}"></div>
        <div class="nav">
            <div class="name">
                <p class="">Name</p>
            </div>
            <div class="namego">
                <p>السيد / اسم المريض</p>
            </div>
            <div class="paid">
                <p class="">Barcode</p>
            </div>
            <div class="paidgo d-flex justify-content-center align-items-center">
                <svg id="visit-normalTests-code" width="266px" height="40px" x="0px" y="0px" viewBox="0 0 266 40" xmlns="http://www.w3.org/2000/svg" version="1.1" style="transform: translate(0,0)"><rect x="0" y="0" width="266" height="40" style="fill:#ffffff;"></rect><g transform="translate(10, 10)" style="fill:#000000;"><rect x="0" y="0" width="4" height="20"></rect><rect x="6" y="0" width="2" height="20"></rect><rect x="12" y="0" width="6" height="20"></rect><rect x="22" y="0" width="2" height="20"></rect><rect x="28" y="0" width="6" height="20"></rect><rect x="36" y="0" width="4" height="20"></rect><rect x="44" y="0" width="2" height="20"></rect><rect x="48" y="0" width="2" height="20"></rect><rect x="54" y="0" width="8" height="20"></rect><rect x="66" y="0" width="2" height="20"></rect><rect x="70" y="0" width="6" height="20"></rect><rect x="78" y="0" width="4" height="20"></rect><rect x="88" y="0" width="2" height="20"></rect><rect x="92" y="0" width="4" height="20"></rect><rect x="104" y="0" width="2" height="20"></rect><rect x="110" y="0" width="2" height="20"></rect><rect x="114" y="0" width="4" height="20"></rect><rect x="126" y="0" width="2" height="20"></rect><rect x="132" y="0" width="4" height="20"></rect><rect x="144" y="0" width="2" height="20"></rect><rect x="148" y="0" width="2" height="20"></rect><rect x="154" y="0" width="6" height="20"></rect><rect x="162" y="0" width="6" height="20"></rect><rect x="170" y="0" width="4" height="20"></rect><rect x="176" y="0" width="2" height="20"></rect><rect x="180" y="0" width="8" height="20"></rect><rect x="194" y="0" width="2" height="20"></rect><rect x="198" y="0" width="2" height="20"></rect><rect x="202" y="0" width="4" height="20"></rect><rect x="212" y="0" width="6" height="20"></rect><rect x="220" y="0" width="4" height="20"></rect><rect x="230" y="0" width="6" height="20"></rect><rect x="238" y="0" width="2" height="20"></rect><rect x="242" y="0" width="4" height="20"></rect></g></svg>
            </div>
            <div class="agesex">
                <p class="">Sex / Age</p>
            </div>
            <div class="agesexgo">
                <p><span class="note">Male</span> / <span class="note">100 Year</span></p>
            </div>
            <div class="vid">
                <p class="">Date</p>
            </div>
            <div class="vidgo">
                <p>
                    <span class="note">2023-01-01</span>
                    <!--&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;<span class="note">00:00:00</span></p>-->
                </p>
            </div>
            <div class="refby">
                <p class="">By</p>
            </div>
            <div class="refbygo">
                <p>المختبر</p>
            </div>
            <div class="prd">
                <p class="">Doctor</p>
            </div>
            <div class="prdgo">
                <p><span class="note">مريض خارجي</span></p>
            </div>
        </div>

        <div class="tester">
    <div class="testhead row sections m-0 mt-2 category_category">
        <div class="col-3">
            <p class="text-right">Test Name</p>
        </div>
        <div class="col-2 justify-content-between">
            <p class="text-center w-75">Result</p>
        </div>
        <div class="col-2 justify-content-between">
            <p class="text-center w-75">Flag</p>
        </div>
        <div class="col-2">
            <p class="text-right">Unit</p>
        </div>
        <div class="col-3">
            <p class="text-right">Normal Range</p>
        </div>
    </div>
    <div class="test typetest pt-3 category_Tests">
                    <p>Tests</p>
                </div><div data-flag="flag" class="test row m-0 category_Tests border-test" id="test_normal_16804570709597136" data-cat="Tests" style="display:flex">
        <div class="testname col-3">
            <p class="text-right w-100">Test Example</p>
        </div>
        <div class="testresult col-2">
            <p class="text-dark w-75 text-center"></p>
        </div>
        <div class="testresult col-2">
            <p class="text-dark w-75 text-center"></p>
        </div>
        <div class="testresult col-2">
            <p> Unit</p>
        </div>
        <div class="testnormal col-3">
            <p class="text-right">
             &gt;= 5
            </p>
        </div>
        <div class="testprice col-12 h5 text-right text-info">
             
        </div>
    </div>
    </div>


    </div>

    <div class="footer2" style="border-top: 5px solid rgb(46, 63, 76); height: ${footer}px;">
        <div class="f1" style="display: ${footer_header_show == '1' ? '' : 'none'};">
            ${address != '' ? `<p><i class="fas fa-map-marker-alt"></i> ${address}</p>` : ""}
        </div>
        <div class="f2" style="display: ${footer_header_show == '1' ? '' : 'none'};">
            <p>
                ${facebook != '' ? `
                <span class="note">
                <i class="fas fa-envelope"></i>  ${facebook}
                </span>
                `: ""}
                ${facebook != '' && phone_1 != '' ? `|` : ""}
                ${phone_1 != '' ? `<span class="note"><i class="fas fa-phone"></i>  ${phone_1}</span>` : ""}
            </p>
        </div>
    </div>
</div>
    `

    invoicePreviewElement.html(invoiceBody);
};

