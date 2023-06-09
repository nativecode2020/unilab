const urlParams = new URLSearchParams(window.location.search),
  barcode = urlParams.get('barcode');

if (barcode) {
  visitDetail(`${barcode}`);
  showAddResult(`${barcode}`)
}

function get_var(_var = '') {
  let r = document.querySelector(':root');
  let rs = getComputedStyle(r);
  alert(`The value of ${_var} is: ` + rs.getPropertyValue(_var));
}

// Create a function for setting a variable value
function set_var(_var, value) {
  let r = document.querySelector(':root');
  // Set the value of variable --blue to another value (in this case "lightblue")
  r.style.setProperty(_var, value);
}

// on page load

// dom ready 
$(function () {
  // change format date of #visit_date to 01-apr-2023


  // let root = document.documentElement;
  // change :root  font_size
  set_var('--font_size', `${invoices?.font_size ?? 20}px`);
  set_var('--typeTest-font', `${(parseInt(invoices?.font_size) + 2) ?? 20}px`);
  set_var('--color-orange', invoices?.color ?? '#ff8800');
  set_var('--invoice-color', invoices?.font_color ?? '#000');
  set_var('--logo-height', `${invoices?.header ?? 175}px`);
  // document.documentElement.style.setProperty('--font_size', `${invoices?.font_size ?? 20}px`);
  // r.style.setProperty('--color-orange', invoices?.color??'red');
  // r.style.setProperty('--water-mark', `url(${invoices.logo})`??'url(../assets/image/logo2.png)');
  $('.half-page').css('height', $(window).height() - 100);
  // add visit form 
  $('#visit-form').append(lab_visits.createForm());
  //resize window
  $(window).resize(function () {
    $('.half-page').css('height', $(window).height() - 100);
  });

  // visits button
  $('#visits-button').click(function () {
    $('.page-form').empty();
    $('.pan').addClass('d-none');
    $('.visits').removeClass('d-none');
    $('#visits-button').addClass('active');
    $('#add-visit-button').removeClass('active');
  });

  // add-visit button
  $('#add-visit-button').click(function () {
    $('.page-form').empty();
    $('.page-form').append(visit_form);
    $('.pan').addClass('d-none');
    $('.detail-page').removeClass('d-none');
    $('.detail-page').empty();
    $('.detail-page').append(packagesList());
    $('#visits-button').removeClass('active');
    $('#add-visit-button').addClass('active');
  });

  $(document).keydown(function (e) {
    if ($(`input.result`).is(":focus") && (e.keyCode == 40 || e.keyCode == 13)) {
      e.preventDefault();
      focusInput("add");
    } else if ($(`input.result`).is(":focus") && e.keyCode == 38) {
      e.preventDefault();
      focusInput("12");
    }
  });

  $('.dt-buttons').addClass('btn-group');
  $('div.addCustomItem').html(`
    <span class="h-22 ml-4 mt-1">الكل</span>
    <label class="d-inline switch s-icons s-outline s-outline-invoice-slider mx-3 mt-2">
        <input type="checkbox" name="currentDay" id="currentDay" checked="" onchange="lab_visits.dataTable.ajax.reload()">
        <span class="invoice-slider slider"></span>
    </label>
    <span class="h-22 mt-1">اليوم</span>
  `);
  $('#input-search-2').on('keyup change', function () {
    var rex = new RegExp($(this).val(), 'i');
    $('.searchable-container .item').hide();
    $('.searchable-container .items.package').filter(function () {
      return rex.test($(this).text());
    }).show();
    $('.searchable-container .item').filter(function () {
      return rex.test($(this).text());
    }).show();
  });
  //////////////////////////////////////////
  setTimeout(() => {
    const mainHeight = $('.main-visit-form').height();

    $('.main-visit-list').height(mainHeight);
    $('.main-visit-tests').height(mainHeight);
    $('.main-visit-selected-tests').height(mainHeight);
  }, 1000);
  // $(document).on('select2:open', (e) => {
  //   // focus on search input for this select2
  //   document.querySelector('.select2-search__field').focus();
  // });
});