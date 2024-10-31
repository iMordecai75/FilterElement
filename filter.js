/**
 * @name CardFilter
 * @description
 * Plugin to manage filters and pagination in a card wall
 * @example
 * HTML
 * <div id="contenitore-card">
 *  <div class="item" data-progetto="progetto1" data-regione="regione1">...</div>
 *  ...
 *  <div class="item" data-progetto="progetto2" data-regione="regione2">...</div>
 * </div>
 * 
 * JS
 * let filterOption = {
 *  pagination: {
 *      enabled: true,
 *      limit: 10
 *  },
 *  itemsClass: 'item',
 *  button: {
 *      class: 'primary',
 *      text: 'Cerca'
 *  },
 *  selects: {
 *      class: 'form-select',
 *      firstItem: 'Scegli ',
 *      config: [
 *          {
 *              filter: 'progetto',
 *              label: 'Progetto',
 *              dependencies: [
 *              ]
 *          }
 *      ]
 *  }
 * };
 * $('#contenitore-card').cardfilter(filterOptions);
 */
(function ($) {
    var CardFilterOptions = {
        pagination: {
            enabled: true,
            limit: 20
        },
        button: {
            class: 'primary',
            text: 'Cerca'
        },
        selects: {
            class: 'form-select',
            firstItem: 'Scegli ',
            config: [
                {
                    filter: '',
                    label: '',
                    dependencie: ''
                }
            ]
        }
    }
    var CardFilter = function (element, options) {
        this.element = $(element);
        this.options = $.extend({}, CardFilter.defaultOptions, options);
    }

    CardFilter.defaultOptions = CardFilterOptions;

    CardFilter.prototype = {
        items: null,
        showItems: [],
        pageClass: '',
        /**
         * @function buildSelect
         * @private 
         * @description Function that returns the html select element
         * @param {string} property Name of the property to take values ​​from
         * @returns jQuery select object
        */
        buildSelect: function (property) {
            let _this = this;
            let values = [];
            let label = property.label;
            let filter = property.filter;
            let dependencie = property.dependencie;
            let select = $('<select name="' + filter + '" class="' + this.options.selects.class + ' me-3 mb-3"></select>');
            select.append('<option value="">' + this.options.selects.firstItem + label + '</option>');
            if (!dependencie) {
                try {
                    _this.items.each(function () {
                        let val = $(this).find('[data-' + filter + ']').attr('data-' + filter);
                        if (val) {
                            let vals = val.split(',');
                            vals.forEach(function (item) {
                                let val = item.trim();
                                if (!values.includes(val)) {
                                    values.push(val);
                                }
                            });                            
                        }
                    });                    
                    values.sort();
                    if (property.order == 'DESC') { 
                        values.reverse();
                    }
                    values.forEach(function (elem) {
                        let option;                        
                        if (property.type == 'date') {
                            const date = new Date(elem);
                            const opt = {
                                year: 'numeric',
                                month: 'numeric',
                                day: 'numeric'
                            }
                            let tmp = date.toLocaleDateString('it-IT', opt);
                            option = $('<option value="' + elem + '">' + tmp + '</option>');
                        } else {
                            option = $('<option value="' + elem + '">' + elem + '</option>');
                        }
                        
                        select.append(option);
                    });                    
                } catch (error) {
                    console.log(error, _this, filter);
                }
            }

            return select
        },
        /**
         * @function buildButton
         * @private
         * @description Function that returns the html button element
         * @returns jQuery button object
         */
        buildButton: function () {
            let _this = this;
            let button = $('<button type="button" class="' + _this.options.button.class + '">' + _this.options.button.text + '</button>');

            return button;
        },
        /**
         * @function buildPages
         * @private
         * @description Function that builds pages
         * @param {jQuery} container Cards container
         */
        buildPages: function (container) {
            let _this = this;
            let pages = 1;
            if (this.options.pagination.enabled) {
                pages = Math.ceil(parseInt(_this.showItems.length) / parseInt(this.options.pagination.limit));
            }                   
            for (let i = 0; i < pages; i++) {
                let page = this.buildPage(i, _this.showItems);
                container.append(page);
            }
            // container.find('div.page').hide();
            // container.find('div.page[data-page="0"]').show();            
            container.find('div.page[data-page="0"]').addClass('show');
        },
        /**
         * @function buildPagination
         * @private
         * @description Function that builds numbering
         * @param {jQuery} container Cards container
         */
        buildPagination: function (container, page_num) {
            let pagination = '';
            let _this = this;
            if (this.options.pagination.enabled) {
                pagination = container.parent().find('nav.pagination__wrapper');
                if (pagination.length == 0) {
                    pagination = $('<nav class="pagination__wrapper"></nav>');
                    container.after(pagination);
                } else {
                    pagination.html('');
                }

                let pages = Math.ceil(_this.showItems.length / this.options.pagination.limit);

                let ul = $('<ul class="pagination ms-0 mb-4"></ul>');
                if (pages > 1 && pages < 10) {
                    for (let i = 0; i < pages; i++) {
                        let li = $('<li class="page-item" data-page="' + i + '"><a class="page-link">' + (i + 1) + '</a></li>');
                        li.on('click', function () {
                            let page = $(this).attr('data-page');
                            _this.emitChangePage(page);
                            container.find('div.pagetab').removeClass('show');
                            container.find('div.pagetab[data-page="' + page + '"]').addClass('show');
                            _this.buildPagination(container, page);
                        })
                        ul.append(li);
                    }                    
                } else if (pages > 10) {
                    page_num = parseInt(page_num);
                    if (page_num < 5) {
                        start = 0;
                        end = 5;
                    } else if (page_num > pages - 5) {
                        start = pages - 6;
                        end = pages - 1;
                    } else {
                        start = page_num - 2;
                        end = page_num + 3;
                    }

                    for (let i = start; i <= end; i++) {
                        let li = $('<li class="page-item" data-page="' + i + '"><a class="page-link">' + (i + 1) + '</a></li>');
                        li.on('click', function () {
                            let page = $(this).attr('data-page');
                            _this.emitChangePage(page);
                            container.find('div.pagetab').removeClass('show');
                            container.find('div.pagetab[data-page="' + page + '"]').addClass('show');
                            _this.buildPagination(container, page);
                        })
                        ul.append(li);
                    }                    
                }
                ul.find('li[data-page="' + page_num + '"]').addClass('active');                    
                pagination.append(ul);
            }
        },
        /**
         * @function buildPage
         * @private
         * @description Function that builds the page
         * @param {number} index Page number
         * @param {jQuery} items Set of visible cards
         * @returns jQuery panel object
         */
        buildPage: function (index, items) {
            let page = $('<div class="page pagetab" data-page="' + index + '"></div>');
            page.addClass(this.pageClass);
            if (this.options.pagination.enabled) {
                let start = index * this.options.pagination.limit;
                let end = start + this.options.pagination.limit;
                items.forEach(function (elem, index) {
                    if (index >= start && index < end) {
                        page.append($(elem));
                    }
                });                
            } else {
                items.forEach(function (elem, index) {
                    page.append($(elem));
                });                
            }

            return page;
        },
        emitSearchButtonClick: function () {
            /**
             * @event searchButtonClick
             */
            this.element.trigger('searchButtonClick');
        },
        emitChangePage: function (page_num) {
            /**
             * @event changePage
             * @param {object} data { 'pageNumber': Numero di pagina cliccato }
             */
            this.element.trigger('changePage', { 'pageNumber': page_num });
        },
        emitAfterInit: function (container) {
            /**
             * @event afterInit
             * @param {object} data {'container' jQuery object}
             */
            this.element.trigger('afterInit', { 'container': container });
        },
        /**
         * @function init
         * @public
         * @description Function that initializes the plugin
         * @returns {HtmlDom} The modified Dom object returns 
         */
        init: function () {
            let _this = this;

            return this.element.each(function () {
                let container = $(this);
                _this.pageClass = container.attr('class');
                let divfilter = $('<div class="filter-container"></div>');
                let row = $('<div class="row"></div>');
                let searchbut = _this.buildButton();
                _this.items = container.children();
                _this.showItems = [];
                _this.items.each(function () {
                    _this.showItems.push($(this));
                });
                searchbut.on('click', function () {
                    let selects = divfilter.find('select');
                    let tmps = [];
                    _this.showItems = [];
                    _this.items.each(function () {
                        _this.showItems.push($(this));
                    });
                    selects.each(function () {
                        let name = $(this).attr('name');
                        let value = $(this).val();
                        if (value != '') {
                            _this.showItems.forEach(function (elem) {
                                let regex = new RegExp('(^|[, ]+)' + value + '([, ]|$)', 'gi');
                                //if (elem.find('[data-' + name + ']').attr('data-' + name) == value) {
                                if(elem.find('[data-' + name + ']').attr('data-' + name).match(regex)){
                                    tmps.push(elem);
                                }
                            });
                            _this.showItems = tmps;
                            tmps = [];
                        }
                    });
                    container.find('.pagetab').detach();
                    container.find('nav').detach();
                    _this.buildPages(container);
                    _this.buildPagination(container, 0);
                    _this.emitSearchButtonClick();
                });
                _this.options.selects.config.forEach(function (elem, idx) {
                    let select = _this.buildSelect(elem);
                    //let div = $('<div class="col-12 col-md-6 col-lg-4 filter"></div>');
                    let div = $('<div class="col-12 col-lg filter"></div>');
                    div.append(select);
                    row.append(div);
                    if (elem.dependencie) {
                        row.find('select[name="' + elem.dependencie + '"]').on('change', function () {
                            let value = $(this).val();
                            select.html('');
                            select.append('<option value="">' + _this.options.selects.firstItem + elem.label + '</option>');
                            let values = [];
                            _this.items.each(function () {
                                let val = $(this).find('[data-' + elem.dependencie + '="' + value + '"]').attr('data-' + elem.filter);
                                if (val && !values.includes(val)) {
                                    values.push(val);
                                }
                            });
                            values.sort();
                            values.forEach(function (elem) {
                                let option = $('<option value="' + elem + '">' + elem + '</option>');
                                select.append(option);
                            });
                        })
                    }
                });
                //let div = $('<div class="col-12 offset-md-6 col-md-6 offset-lg-0 col-lg-4 butt-action"></div>');
                let div = $('<div class="col-12 offset-md-6 offset-lg-0 col-lg butt-action"></div>');
                div.append(searchbut);
                row.append(div);
                divfilter.append(row);
                container.before(divfilter);
                _this.buildPages(container);
                _this.buildPagination(container, 0);
                _this.emitAfterInit(container);
                container.removeClass("row");
                container.addClass("row-pages");
            });
        }
    }

    $.fn.cardfilter = function (options) {
        return this.each(function () {
            var plugin = new CardFilter(this, options);
            plugin.init();
            $.data(this, 'cardfilter', plugin);
        });
    };
})(jQuery)