'use strict';

const Q = require('q');
const ptr = require('path-to-regexp');

class MenuElement {
  constructor(menu, name, ref, order, sub, active) {
    this.menu = menu || null;
    this.name = name || 'Untitled';
    this.ref = ref || '#';
    this.order = order !== undefined ? order : -1;
    this.sub = sub || null; // if submenu, assign a function
    this.active = active || false;
  }

  getMenu() {
    return this.menu;
  }
}

class Menu {
  constructor(name) {
    this.name = name;
    this.elements = [];
    this.fn = null;
    this.rendered = null;
    this.waitersPromise = null;
  }

  addElement(name, ref, order, sub, active) {
    this.elements.push({
      name: name,
      ref: ref,
      order: order,
      sub: sub || null
    });
  }

  render(cleverCore, req, cb, parent) {

    this.waitersPromise = [];

    function generateElement(el, index) {
      const menuEl = new Menu.MenuElement(self, el.name, el.ref, el.order, el.sub);
      const defer = Q.defer();
      self.waitersPromise.push(defer.promise);
      if(typeof menuEl.sub === 'function') {
        menuEl.sub(cleverCore, req, defer, menuEl);
      } else {
        defer.resolve();
      }

      if(ptr(req.route.path).test(menuEl.ref)) {
        menuEl.active = true;
        if(parent) {
          parent.active = true;
        }
      }

      // Attach the promise to parent menu
      if(parent) parent.getMenu().waitersPromise.push(defer);

      return menuEl;
    }

    // Caching the rendered
    // if(this.rendered) return cb(null, this.rendered);

    const self = this;

    self.rendered = {};
    self.rendered.name = self.name;

    const fnElements = [];

    self.elements.forEach(function (el, index) {
      fnElements.push(generateElement(el, index));
    });

    if(self.fn) {
      const defer = Q.defer();
      self.waitersPromise.push(defer.promise);
      self.fn(cleverCore, function(err, rawElements) {
        if(err) return defer.reject(err);
        rawElements.forEach(function (el, index) {
          fnElements.push(generateElement(el, index));
        });
        defer.resolve();
      });
    }

    Q.all(self.waitersPromise).done(function() {
      self.rendered.elements = fnElements;
      cb(null, self.rendered);
    }, function(err) {
      cb(err);
    });
  }

  // deleteCache() {
  //   this.rendered = null;
  // }

}

Menu.MenuElement = MenuElement;

module.exports = Menu;
