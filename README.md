<h1>Fast DB2</h1>
<p>Bu proje node.js ortamı için geliştiriliyor ve amaç basit kullanışlı bir veritabanı hizmeti sağlamaktır</p>
<p>Veritabanı NOSQL gibi esnek bir kullanıma sahiptir</p>
<b><p>Fonksiyonları:</p></b>
  <ul>
    <li> <code>await result=dbCreate(username,password,databasename);</code>
     değişkenlere ilgili değerler girilir ve db değişkenimiz'e 
     {hash,dbname} değeri atanır. Burada hash database için benzersiz bir anahtardır.
      </li>
<li> <code>await userhash=UserLogin(username,password);</code>
     Bu kod database'imizin daha sonra SelectDB ile seçimi için ihtiyacımız olan anahtar değerini(hash) getirir.
      </li>
<li> <code>await db=SelectDB(hash,dbname);</code>
     Bu kod UserLogin ile aldığımız anahtar değeri ve veritabanı adını kullanır ve ilgili veritabanınını seçer ve
     daha sonrasında search,insert,update,delete gibi fonksiyonlarda kullanılmak üzere gereken veritabanı bilgisini döndürür     
 </li>
 <li> <code>await result=ResetPassword(username,newpassword);</code>
     Yanlışlıkla kullanıcı parolasını unutursa bu fonksiyon kullanıcıyı arar ve kullanıcı mevcutsa yeni parola ile birlikte yeni bir anahtar değeri oluştup veritabanı dosyasını günceller    
</li>
 <li> <code>await result=SearchQuery(selecteddb,query);</code>
     seçilen veritabanı içerisindeki sorguya uyan kayıtların id ve içeriğini döndürür.
     sorgu kısmı sql'e benzer bir iki farkla ayrılır
     <p>Temel sorgu operatörleri "<=,>=,>,<,=,!=" gibi operatörlere ek "<like>" "<notlike>" tarzı iki operatör daha içerir;
     "<like>" Parametrede varsa aranılan değerin bir kısmı yada tamamı kaydın içinde varsa o kaydı döndürür "<notlike" içinde yok ise o kaydı döndürür.</p>
     <p>Mantıksal Operatörler "AND,OR,NAND,NOR" gibi operatörler vasıtasıyla aynı parametrenin birden fazla durumu yada farklı paramaterelerin durumu birleştirilerek 
     daha geniş sorgu yapmayı mümkün hale getirir.Parantez kullanarak sorguyu daha speisifik hale getirmekte mümkündü.r</p>
     <p>Örnek:
     Adı ali yaşı 15 ten büyük olan kayıtların gelsin 
     "name=ali AND age>15" şeklinde sorgumuz yazılır</p>
     Başka bir örnek
     <p>
     Silindir tipi "L" olan ve silindir sayısı 5 ten büyük 13 ten küçük araçların olduğu kayıtların getirilmesi için
     "cyltype=L AND (cyl>5 AND cyl<13)" şeklinde sorgular yazabiliyoruz. Burda önemli olan husus sorgudaki parametrelerin kaydın içinde olmasıdır 
     {cyl:6,turbo:false} gibi bir kayıtta color parametresinin aramasını yapmak istersek boş veri dönecektir.   
 </p>
</li>
<li><code>let result=InsertData(selecteddb,content)</code> content {name:"John"} gibi bir kaydı eklemek içindir 
</li>
  <li><code>let result=UpdateData(selecteddb,id,content)</code> id değeri belli olan kaydı değiştirmek için kullanılır bu kayıt bir önceki kaydın yapısı ile birebir olma zorunluluğu yoktur
mesela:Bir önceki kayıt:{username:"John",Age:13} sonraki kayıt {username:"John",Age:13,City:"Utah"} olabilir 
</li>
<li><code>let result=DeleteData(selecteddb,id)</code> id değeri belli olan kaydı silmek için kullanılır <mark>silinen kayıt tekrar getirilemez</mark> 
</li>
  </ul>
