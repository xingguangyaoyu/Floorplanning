let py;
self.onmessage=async({data})=>{
 try{
  if(!py){self.postMessage({type:'status',text:'Loading local Python runtime…'});const {loadPyodide}=await import('../vendor/pyodide/pyodide.mjs');py=await loadPyodide({indexURL:new URL('../vendor/pyodide/',import.meta.url).href});}
  py.globals.set('_source',data.source);py.globals.set('_checks',JSON.stringify(data.tests));
  const result=await py.runPythonAsync(`
import io, json, contextlib, math
_scope = {"math": math}
def raises_value_error(f):
    try: f()
    except ValueError: return True
    return False
_scope["raises_value_error"] = raises_value_error
_buffer=io.StringIO()
_results=[]
with contextlib.redirect_stdout(_buffer):
    try:
        exec(_source,_scope)
        for _name,_expression in json.loads(_checks):
            try:
                _ok = bool(eval(_expression,_scope))
                _results.append({"name":_name,"status":"PASS" if _ok else "FAIL"})
            except NotImplementedError as e:
                _results.append({"name":_name,"status":"INCOMPLETE","error":str(e)})
            except Exception as e:
                _results.append({"name":_name,"status":"FAIL","error":str(e)})
    except Exception as e:
        _results.append({"name":"source","status":"FAIL","error":str(e)})
json.dumps({"checks":_results,"stdout":_buffer.getvalue()})
`);
  self.postMessage({type:'result',...JSON.parse(result)});
 }catch(e){self.postMessage({type:'error',text:String(e)});}
};
