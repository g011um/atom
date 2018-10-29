"use strict";

(function ($, Qubit) {

  Qubit.TreeviewPager = function(limit, treeEl, url)
  {
    Qubit.Pager.call(this, limit);
    this.treeEl = treeEl;
    this.url = url;
  }

  Qubit.TreeviewPager.prototype = new Qubit.Pager;

  Qubit.TreeviewPager.prototype.getAndAppendNodes = function(cb)
  {
    // Assemble query and creation queue
    var queryString = "?skip=" + this.getSkip() + "&nodeLimit=" + this.getLimit();
    var pagedUrl = this.url + queryString;
    var createQueue = [];
    var self = this;

    // Get and append additional nodes
    $.ajax({
      url: pagedUrl,
      success: function(results) {
        // Add nodes to creation queue
        results.nodes.forEach(function(node) {
          createQueue.push(node);
        });

        var next = function()
        {
          if (createQueue.length)
          {
            // Queue isn't empty: create node
            var node = createQueue.shift();
            self.treeEl.jstree(true).create_node("#", node, "last", next);
          }
          else
          {
            // Queue is empty so excute cleanup logic
            cb();
          };
        };

        next();
      }
    });
  }

  // Update count of remaining nodes, etc.
  Qubit.TreeviewPager.prototype.updateMoreLink = function($moreButton)
  {
    var moreLabel = $moreButton.data('label');

    if (this.getRemaining() > 0)
    {
      // Update count shown in paging button
      $moreButton.show();
      $moreButton.val(moreLabel.replace('%1%', this.getRemaining()));
    }
    else
    {
      // Hide paging button
      $moreButton.hide();
    }

    // Scroll to last item in tree
    if ($('li.jstree-node:last').length)
    {
      $('li.jstree-node:last')[0].scrollIntoView(true);
    }
  }

  Qubit.TreeviewPager.prototype.reset = function($moreButton)
  {
    this.setSkip(0);

    // Only reset tree if it already exists
    if (this.treeEl.jstree(true) !== false)
    {
      this.treeEl.jstree(true).clear_state();
      this.treeEl.jstree(true).refresh(true, true);
    }

    // Update paging button and scroll treeview window to first node
    this.updateMoreLink($moreButton);
    $('li.jstree-node:first')[0].scrollIntoView(true);
  }
})(jQuery, Qubit);
