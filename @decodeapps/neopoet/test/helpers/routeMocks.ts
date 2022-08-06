export const req = ( params: Record<string, unknown> ) => {
  var req = {
    params : params
  };
  return req;
}

export const res = ( callback: () => void ) => {
  return {
    viewName : '',
    data     : {},
    _json: {},
    render   : function ( view: string, data: Record<string, unknown> ) { this.viewName = view; this.data = data; callback(); },
    json     : function ( json: JSON ) { this._json = json; callback(); }
  };
}
