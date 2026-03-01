export const pythagorean: Record<string, number> = {
  a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,
  s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8,'\u00e7':3,'\u011f':7,'\u0131':9,'\u00f6':6,'\u015f':1,'\u00fc':3,
};

export const SESLI = new Set(['a','e','\u0131','i','o','\u00f6','u','\u00fc']);

export function indirge(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((s, d) => s + parseInt(d), 0);
  }
  return n;
}

export function harfToplam(metin: string): number {
  return metin.toLowerCase().split('').reduce((s, c) => s + (pythagorean[c] || 0), 0);
}
