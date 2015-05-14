module.exports = {
  folderFilterToConstraint: function(folderFilter) {
    var connection = require('../routes/Database').Get();
    const selected = folderFilter.selected === 'true' || folderFilter.selected === true;
    const thisConstraint = selected ? ' OR path = ' + connection.escape(folderFilter.name) : '';
    let childrenConstraint = '';
    if (folderFilter.allSubfoldersSelected !== 'true' && folderFilter.allSubfoldersSelected !== true) {
      if (typeof folderFilter.content !== 'undefined')
        childrenConstraint = folderFilter.content.map(function (child) {
          if (typeof child !== 'undefined' && child !== '')
            return folderFilterToConstraint(child);
          else
            return '';
        }).join('');
    } else {
      childrenConstraint = ' OR path LIKE ' + connection.escape(folderFilter.name + '%');
    }
    return thisConstraint + childrenConstraint;
  }
};