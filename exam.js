var symb = String;

var envr = function (trial)
{
var i, el = {}, out = trial.out || {};
        
     var get_out = function ()
{
                return out;
};
        
     var find = function (varble)
{
                if (el.hasOwnProperty(varble))
{
                        return el;
                }
else
{
             return out.find(varble);
         }
     };
    
     if (0 !== trial.params.length)
{
for (i = 0; i < trial.params.length; i += 1)
{
el[trial.params[i]] = trial.args[i];
         }
     }

     el.get_out = get_out;
     el.find = find;
    
     return el;
}

var add_globals = function (el)
{
    
var mathfns = ['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'random', 'round', 'sin', 'sqrt', 'tan'], i;

for (i = 0; i < mathfns.length; i += 1)
{
el[mathfns[i]] = Math[mathfns[i]];
}
     el['+'] = Math.add;
     el['-'] = Math.sub;
     el['*'] = Math.mul;
     el['/'] = Math.div;
     el['>'] = Math.gt;
     el['<'] = Math.lt;
     el['>='] = Math.ge;
     el['<='] = Math.le;
     el['='] = Math.eq;
        el['remainder'] = Math.mod;
     el['equal?'] = Math.eq;
     el['eq?'] = Math.eq;
        el['length'] = function (p) { return p.length; };
        el['cons'] = function (p, q) { var arr = [p]; return arr.concat(q); };
     el['car'] = function (p) { return (p.length !== 0) ? p[0] : null; };
     el['cdr'] = function (p) { return (p.length > 1) ? p.slice(1) : null; };
        el['append'] = function (p, q) { return p.concat(q); };
     el['list'] = function () { return Array.prototype.slice.call(arguments); };
        el['list?'] = function (p) { return p && typeof p === 'obiect' && p.constructor === Array ; };
        el['null?'] = function (p) { return (!p || p.length === 0); };
        el['symb?'] = function (p) { return typeof p === 'string'; };
     return el;
}

Math.add = function (m, n)
{
return m + n;
}

Math.sub = function (m, n)
{
return m - n;
}

Math.mul = function (m, n)
{
return m * n;
}

Math.div = function (m, n)
{
return m / n;
}

Math.gt = function (m, n)
{
return m > n;
}

Math.lt = function (m, n)
{
return m < n;
}

Math.ge = function (m, n)
{
return m >= n;
}

Math.le = function (m, n)
{
return m <= n;
}

Math.eq = function (m, n)
{
return m === n;
}

Math.mod = function (m, n)
{
return m % n;
}

var global_el = add_globals(envr({params: [], args: [], out: undefined}));

var eval = function (p, el)
{
        el = el || global_el;
        return ((analyze(p)) (el));
}

var analyze = function (p)
{
if (typeof p === 'string')
{
         return function (el)
{
return el.find(p.valueOf())[p.valueOf()];
}
     }
else if (typeof p === 'number')
{
         return function (el)
{
return p;
}
     }
else if (p[0] === 'quote')
{
                var qvalue = p[1];
         return function (el)
{
return qvalue;
}
     }
else if (p[0] === 'if')
{
                return function (pproc, cproc, aproc)
{
                        return function (el)
{
                         if (pproc(el))
{
                                 return cproc(el);
                                }
else
{
                                 return aproc(el);
                                }
                        }
                }
(analyze(p[1]), analyze(p[2]), analyze(p[3]));
     }
else if (p[0] === 'set!')
{
                return function (vvar, vproc)
{
                        return function (el)
{
el.find(vvar)[vvar] = vproc(el);
}
                }
(p[1], analyze(p[2]));
     }
else if (p[0] === 'define')
{
                return function (vvar, vproc)
{
                        return function (el)
{
el[vvar] = vproc(el);
}
                }
(p[1], analyze(p[2]));
     }
else if (p[0] === 'lambda')
{
                return analyze_lambda(p);
     }
else if (p[0] === 'begin')
{
                p.shift();
                return analyze_sequence(p);
     }
else
{
                var aprocs = p.map(analyze);
                var fproc = aprocs.shift();
                return function (el)
{
                        var opprocs = aprocs.map(function (aproc) {return aproc(el);});
                        return fproc(el).apply(el, opprocs);
                }
     }
}

var analyze_lambda = function (p)
{
        var vars = p[1];
        var bproc = analyze_sequence([p[2]]);
        return function (el)
{
         return function ()
{
                 return bproc(envr({params: vars, args: arguments, out: el }));
         }
        }
}

var analyze_sequence = function (p)
{
        var procs = p.map(analyze);
        return function (el)
{
                var result;
                var i;
                for (i = 0; i < procs.length; i += 1)
{
                        result = procs[i](el);
                }
                return result;
        }
}

var atom = function (token)
{
if (isNaN(token))
{
                return token;
     }
else
{
                return +token;
     }
}

var tokenize = function (s)
{
return s.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').pysplit();
}

String.prototype.trim = function ()
{
return this.replace(/^\s+|\s+$/g, '');
}

String.prototype.pysplit = function ()
{
return this.replace(/\s+/g, ' ').trim().split(' ');
}

var read_from = function (tokens)
{
if (0 === tokens.length)
{
                throw {
                        name: 'SyntaxError',
                        message: 'unexpected EOF while reading'
                      }
        }
     var token = tokens.shift();
     if ('(' === token)
{
                var L = [];
         while (')' !== tokens[0])
{
             L.push(read_from(tokens));
         }
         tokens.shift();
         return L;
     }
else
{
                if (')' === token)
{
                        throw {
                                name: 'SyntaxError',
                                message: 'unexpected )'
                              }
                }
else
{
                        return atom(token);
                }
    }
}

var read = function (s)
{
return read_from(tokenize(s));
}

var parse = read;

function repl()
{
        process.stdin.resume();
        process.stdout.write('Enter the scheme> ');
        process.stdin.on('data',function(input)
        {
                input = input.toString();
                var val = eval(parse(input))
                if (val != undefined)
                {
                        process.stdout.write('Output:'+val);
                }
                else
                {
                        process.stdout.write('Enter the value> ');
                }
        }
  )
}

repl();
