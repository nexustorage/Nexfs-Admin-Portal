/*
nexfsmgmt.js v1.5  www.nexustorage.com

(c) 2022 2023 2024 by Nexustorage Limited. All rights reserved.
(c) 2022 2023 2024 by Glen Olsen email: glen@glenolsen.net. All rights reserved.
// This file is part of Nexustorage Nexfs Storage stack
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


var LastHttpRequest = {};
LastHttpRequest.active = 0;

function hidediv(thediv) {
    document.getElementById(thediv).classList.remove("visible");
    document.getElementById(thediv).classList.add("hidden");
}

function showdiv(thediv) {
    document.getElementById(thediv).classList.remove("hidden");
    document.getElementById(thediv).classList.add("visible");

}

function setfolderdefaults() {
    document.getElementById('foldername').value = '';
    document.getElementById('folderowner').value = '';
    document.getElementById('foldergroup').value = '';
    document.getElementById('folderownerread').checked = true;
    document.getElementById('folderownerwrite').checked = true;
    document.getElementById('folderowneropen').checked = true;
    document.getElementById('foldergroupread').checked = true;
    document.getElementById('foldergroupwrite').checked = true;
    document.getElementById('foldergroupopen').checked = true;
    document.getElementById('folderotherread').checked = false;
    document.getElementById('folderotherwrite').checked = false;
    document.getElementById('folderotheropen').checked = false;
    document.getElementById('savefolderbutton').className = 'buttondisabled';
}

function openfolderinfo() {
    setfolderdefaults();
    document.getElementById('folderinfodiv').classList.remove("hidden");
}

function createdirectoryselect() {
    document.getElementById('folderinfoparentfolder').value = document.getElementById('fileselectcurrentfolder').value;
    document.getElementById('savefolderbutton').innerHTML = '<center>Create</center>';
    document.getElementById('orgfoldername').value = '';
    openfolderinfo();
}

function closefolderinfo() {
    setfolderdefaults();
    document.getElementById('folderinfodiv').classList.add("hidden");
}

function validatefoldername() {
    if (document.getElementById('foldername').checkValidity() == false) {
        document.getElementById('savefolderbutton').className = 'buttondisabled';
    } else {
        document.getElementById('savefolderbutton').className = 'button';
    }
}

function uploadnewsecretkey() {
    if (document.getElementById('dosecretupdate').className != 'button') {
        return;
    }

    let currentkey = document.getElementById('currentsecretkey').value;
    let newkey = document.getElementById('newsecretkey').value;

    let OldSecretHash = new CryptoMD5.MD5(currentkey).toString(CryptoMD5.enc.Hex);
    let NewSecretHash = new CryptoMD5.MD5(newkey).toString(CryptoMD5.enc.Hex);

    sendupdatesecretrequest(OldSecretHash, NewSecretHash);
}


function clearchangesecretkeyform() {
    document.getElementById('currentsecretkey').value = '';
    document.getElementById('newsecretkey').value = '';
    document.getElementById('newsecretkey2').value = '';
    document.getElementById('secretnotmatch').className = 'hidden';
    document.getElementById('dosecretupdate').className = 'buttondisabled';
    document.getElementById('cancelsecretupdate').className = 'buttondisabled';
    document.getElementById('currentsecretkey').required = 0;
    document.getElementById('newsecretkey').required = 0;
    document.getElementById('newsecretkey2').required = 0;
}

function validatechangesecretkey() {
    let formvalid = 1;

    document.getElementById('currentsecretkey').required = 1;
    document.getElementById('newsecretkey').required = 1;
    document.getElementById('newsecretkey2').required = 1;

    if (document.getElementById('currentsecretkey').checkValidity() == false) {
        formvalid = 0;
    }
    if (document.getElementById('newsecretkey').checkValidity() == false) {
        formvalid = 0;
    }
    if (document.getElementById('newsecretkey2').checkValidity() == false) {
        formvalid = 0;
    }

    if (document.getElementById('newsecretkey').value != document.getElementById('newsecretkey2').value) {
        document.getElementById('secretnotmatch').className = '';
        formvalid = 0;
    } else {
        document.getElementById('secretnotmatch').className = 'hidden';
    }

    if (formvalid == 0) {
        document.getElementById('dosecretupdate').className = 'buttondisabled';
    } else {
        document.getElementById('dosecretupdate').className = 'button';
    }

    document.getElementById('cancelsecretupdate').className = 'button';

}

function completecreatefile() {
    var newfile = document.getElementById('editfilename').value;
    /* var fileselectcurrentfolder = document.getElementById('fileselectcurrentfolder').value; */
    var insertpos = 0;

    const filentries = document.getElementsByName("fileentry");
    for (let i = 0; i < filentries.length; i++) {
        if (filentries[i].id > 'filelistrow' + newfile) {
            insertpos = i + 1;
            break;
        }
    }

    var table = document.getElementById('filelisttable');

    if (filentries.length == 0 || insertpos == 0) {
        insertpos = -1;
    }

    var row = table.insertRow(insertpos);
    row.name = 'fileentry';
    row.id = 'filelistrow' + newfile;
    row.className = 'notselectedfilelistrow';
    row.addEventListener("click", function() { togglefileselectedrow('filelistrow' + newfile); });
    row.setAttribute('entrytype', 'file');

    var cell1 = row.insertCell(0);
    cell1.className = 'fileselecttypeicon';
    cell1.innerHTML = "<img src='/fileblueicon.png'>";

    var cell2 = row.insertCell(1);
    cell2.className = 'fileselectentry';
    cell2.id = 'filelistrow' + newfile + 'value';
    cell2.innerHTML = newfile;

    closeeditfile();
}

function completecreatefolder() {
    var newfolder = document.getElementById('foldername').value;
    var fileselectcurrentfolder = document.getElementById('fileselectcurrentfolder').value;
    var insertpos = 0;

    const filentries = document.getElementsByName("fileentry");
    for (let i = 0; i < filentries.length; i++) {
        if (filentries[i].id > 'filelistrow' + newfolder) {
            insertpos = i + 1;
            break;
        }
    }

    var table = document.getElementById('filelisttable');

    if (filentries.length == 0 || insertpos == 0) {
        insertpos = -1;
    }

    var row = table.insertRow(insertpos);
    row.name = 'fileentry';
    row.id = 'filelistrow' + newfolder;
    row.className = 'notselectedfilelistrow';
    row.addEventListener("click", function() { togglefileselectedrow('filelistrow' + newfolder); });
    row.setAttribute('entrytype', 'directory');

    let onclickentry = '"filelistrow' + newfolder + '"';
    var chgdir = "onclick='updirlisting(";
    onclickentry = '"' + fileselectcurrentfolder + newfolder + '/"';
    chgdir += onclickentry;
    chgdir += ")'";

    row.addEventListener("dblclick", function() { updirlisting(fileselectcurrentfolder + newfolder + '/'); });

    var cell1 = row.insertCell(0);
    cell1.className = 'fileselecttypeicon';
    cell1.innerHTML = "<img src='/folderwithforwardarrow.png' " + chgdir + ">";

    var cell2 = row.insertCell(1);
    cell2.className = 'fileselectentry';
    cell2.id = 'filelistrow' + newfolder + 'value';
    cell2.innerHTML = newfolder;

    closefolderinfo();
}

function saveeditfile() {
    var folderjson = '{ "Files": [ { "Name": "' + document.getElementById('editfilename').value + '",';

    var filesize = document.getElementById('editfilesize').value;

    switch (document.getElementById('editfilesizeunit').value) {
        case 'kB':
            filesize *= 1000;
            break;

        case 'mB':
            filesize *= 1000000;
            break;

        case 'gB':
            filesize *= 1000000000;
            break;

        case 'tB':
            filesize *= 1000000000000;
            break;
    }
    folderjson += '"Size": ' + filesize + ',';

    if (document.getElementById('editfilechunksize').value.length > 0) {
        folderjson += '"ChunkSize": ' + document.getElementById('editfilechunksize').value + ',';
    }

    if (document.getElementById('editfileowner').value.length > 0) {
        folderjson += '"Owner": "' + document.getElementById('editfileowner').value + '",';
    }

    if (document.getElementById('editfilegroup').value.length > 0) {
        folderjson += '"Group": "' + document.getElementById('editfilegroup').value + '",';
    }

    if (document.getElementById('editfileownerread').checked) {
        folderjson += '"OwnerRead": 1,';
    }
    if (document.getElementById('editfileownerwrite').checked) {
        folderjson += '"OwnerWrite": 1,';
    }
    if (document.getElementById('editfileownerexecute').checked) {
        folderjson += '"OwnerExec": 1,';
    }

    if (document.getElementById('editfilegroupread').checked) {
        folderjson += '"GroupRead": 1,';
    }
    if (document.getElementById('editfilegroupwrite').checked) {
        folderjson += '"GroupWrite": 1,';
    }
    if (document.getElementById('editfilegroupexecute').checked) {
        folderjson += '"GroupExec": 1,';
    }

    if (document.getElementById('editfileotherread').checked) {
        folderjson += '"OtherRead": 1,';
    }
    if (document.getElementById('editfileotherwrite').checked) {
        folderjson += '"OtherWrite": 1,';
    }
    if (document.getElementById('editfileotherexecute').checked) {
        folderjson += '"OtherExec": 1,';
    }

    folderjson += '"Path": "' + document.getElementById('fileeditparentfolder').value + '" } ';

    folderjson += '] }';

    SendJSONrequest(folderjson, 'CreateFile');
}

function savefolder() {
    var folderjson = '{ "Folders": [ { "Name": "' + document.getElementById('foldername').value + '",';

    if (document.getElementById('folderowner').value.length > 0) {
        folderjson += '"Owner": "' + document.getElementById('folderowner').value + '",';
    }

    if (document.getElementById('foldergroup').value.length > 0) {
        folderjson += '"Group": "' + document.getElementById('foldergroup').value + '",';
    }

    if (document.getElementById('folderownerread').checked) {
        folderjson += '"OwnerRead": 1,';
    }
    if (document.getElementById('folderownerwrite').checked) {
        folderjson += '"OwnerWrite": 1,';
    }
    if (document.getElementById('folderowneropen').checked) {
        folderjson += '"OwnerExec": 1,';
    }

    if (document.getElementById('foldergroupread').checked) {
        folderjson += '"GroupRead": 1,';
    }
    if (document.getElementById('foldergroupwrite').checked) {
        folderjson += '"GroupWrite": 1,';
    }
    if (document.getElementById('foldergroupopen').checked) {
        folderjson += '"GroupExec": 1,';
    }

    if (document.getElementById('folderotherread').checked) {
        folderjson += '"OtherRead": 1,';
    }
    if (document.getElementById('folderotherwrite').checked) {
        folderjson += '"OtherWrite": 1,';
    }
    if (document.getElementById('folderotheropen').checked) {
        folderjson += '"OtherExec": 1,';
    }

    folderjson += '"Path": "' + document.getElementById('folderinfoparentfolder').value + '" } ';

    folderjson += '] }';

    SendJSONrequest(folderjson, 'CreateFolder');
}

function enableiscsibuttons(section) {
    var iscsitovalidate = document.getElementById(section + 'sdiv').getElementsByClassName("iscsivalidate");
    for (let i = 0; i < iscsitovalidate.length; i++) {
        if (iscsitovalidate[i].checkValidity() == false) {
            document.getElementById(section + 'save').className = 'buttondisabled';

            if (section != 'iscsitarget') {
                document.getElementById(section + 'revert').className = 'buttondisabled';
            }
            return;
        }
    }

    document.getElementById(section + 'save').className = 'button';
    document.getElementById(section + 'revert').className = 'button';
}

function iscsideletecheckbox(section, therow) {
    if (document.getElementById('iscsi' + section + 'delete' + therow).checked) {
        document.getElementById('iscsi' + section + 'row' + therow).classList.add('deletenabled');
        if (section == 'interface') {
            document.getElementById('iscsi' + section + 'address' + therow).required = false;
            document.getElementById('iscsi' + section + 'port' + therow).required = false;
        } else if (section == 'account') {
            if (!document.getElementById('iscsi' + section + 'username' + therow).enabled) {
                document.getElementById('iscsi' + section + 'username' + therow).required = false;
            }
            document.getElementById('iscsi' + section + 'password' + therow).required = false;
        }

    } else {
        document.getElementById('iscsi' + section + 'row' + therow).classList.remove('deletenabled');
        if (section == 'interface') {
            document.getElementById('iscsi' + section + 'address' + therow).required = true;
            document.getElementById('iscsi' + section + 'port' + therow).required = true;
        } else if (section == 'account') {
            if (document.getElementById('iscsi' + section + 'username' + therow).enabled) {
                document.getElementById('iscsi' + section + 'username' + therow).required = true;
            }
            document.getElementById('iscsi' + section + 'password' + therow).required = true;
        }
    }

    enableiscsibuttons('iscsi' + section);
}

function iscsitargetadd(targetid) {
    var onchange = 'onchange="';
    onchange += "enableiscsibuttons('iscsitarget')";
    onchange += '" ';
    var ondelete = 'onchange="';
    ondelete += "iscsideletecheckbox('target','X')";
    ondelete += '" ';

    var rawhtml = '<div class="iscsitargetcontent" id="iscsitargetX" iscsitargetid="X">' +
        '        <table>' +
        '          <tr>' +
        '            <td><div class="iscsilabel" onclick="openshowhelp(@iscsitargetid@)">Target ID</div></td>' +
        '            <td class="iscsitargetidvalue"><div>X</div></td>' +
        '            <td><div class="iscsilabel" onclick="openshowhelp(@iSCSItargetinterface@)">Interfaces</div></td>' +
        '            <td></td>' +
        '            <td><div class="iscsilabel" onclick="openshowhelp(@iSCSItargetaccount@)">Inbound Accounts</div></td>' +
        '            <td><div class="iscsilabel" onclick="openshowhelp(@iSCSItargetaccount@)">Outbound Account</div></td>' +
        '          </tr>' +
        '          <tr>' +
        '            <td><div class="iscsilabel" onclick="openshowhelp(@iscsitargetheaderdigest@)">Header Digest</div></td>' +
        '            <td class="iscsitargetidvalue"><input type="checkbox" name="iscsitargetX" id="iscsitargetheaderdigestX" ONCHANGE></td>' +
        '            <td rowspan="2"><div class="iscsiselect"><select id="iscsitargetinterfacesX" multiple ></select></div></td>' +
        '            <td><div class="iscsirefreshicon"><img src="RefreshIcon.png" onclick="refreshiscsiinterfacelist(@X@,@0@)"></div></td>' +
        '            <td rowspan="2"><div class="iscsiselect"><select id="iscsiinboundaccountsX" multiple ONCHANGE></select></div></td>' +
        '            <td ><div class="iscsiselect"><select id="iscsitargetaccountsX" ONCHANGE><option value="n0n3xfs0utb0undacc0unt" bound="0"></option></select></div></td>' +
        '            <td><div class="iscsirefreshicon"><img src="RefreshIcon.png" onclick="refreshiscsiaccountlist(@X@,@0@)"></div></td>' +
        '          </tr>' +
        '          <tr>' +
        '            <td><div class="iscsilabel" onclick="openshowhelp(@iscsitargetheaderdigest@)">Data Digest</div></td>' +
        '            <td class="iscsitargetidvalue"><input type="checkbox" name="iscsitargetX" id="iscsitargetdatadigestX" ONCHANGE></td>' +
        '          </tr>' +
        '        </table>' +
        '        <div class="iscsitargetXlunsdiv" id="iscsitargetXlunsdiv" iscsiluncount="0">' +
        '        </div>' +
        '        <br>' +
        '        <div id="iscsitargetlunsXadd" class="button" style="left:50px;" onclick="iscsitargetlunadd(@X@,@0@);"><center>Add Lun</center></div>' +
        '        <br>' +
        '</div>';

    const targethtml = rawhtml.replace(/@/g, "'");

    let iscsitargetcount = parseInt(document.getElementById('iscsitargetsdiv').getAttribute('iscsitargetcount'));
    let nexttargetid;

    if (targetid == null) {
        nexttargetid = iscsitargetcount + 1;
    } else {
        nexttargetid = targetid;
    }
    const targethtmlwithonchange = targethtml.replace(/ONCHANGE/g, onchange);
    const targetwithondelete = targethtmlwithonchange.replace(/ONDELETE/g, ondelete);
    const targethmlwithid = targetwithondelete.replace(/X/g, nexttargetid);

    if (iscsitargetcount < nexttargetid) {
        document.getElementById('iscsitargetsdiv').setAttribute('iscsitargetcount', nexttargetid);
    }
    document.getElementById('iscsitargetsdiv').insertAdjacentHTML('beforeend', targethmlwithid);
    enableiscsibuttons('iscsitarget');

    if (targetid == null) {
        refreshiscsiinterfacelist(nexttargetid, 'accountlist');
    }
    return nexttargetid;
}

function iscsitargetlunadd(targetid, lunid) {
    var onchange = 'onchange="';
    onchange += "enableiscsibuttons('iscsitarget')";
    onchange += '" onkeyup="';
    onchange += "enableiscsibuttons('iscsitarget')";
    onchange += '" ';
    var ondelete = 'onchange="';
    ondelete += "iscsideletecheckbox('targetlun','X')";
    ondelete += '" ';

    var rawhtml = '<div class="iscsitargetXlun" id="iscsitargetXlunY" iscsilunid="Y">' +
        '        <table>' +
        '          <tr id="iscsitargetXlunrowY">' +
        '            <td><div class="iscsilabel" onclick="openshowhelp(@iSCSIlun@)">Lun ID</div></td>' +
        '            <td class="iscsilunidlabel">Y</td>' +
        '            <td><div class="iscsilabel" onclick="openshowhelp(@iSCSIlunpath@)">Path</div></td>' +
        '            <td class="iscsiaccountuserlabel"><input class="iscsivalidate" id="iscsilunpathtargetXlunY" style="width: 300px;" required ONCHANGE></td>' +
        '            <td class="lunpathimg" onclick="selectfile(@iscsilunpathtargetXlunY@)"><img src="openfolderblue.png"></td>' +
        '            <td><div class="iscsilabel" onclick="openshowhelp(@iSCSIsn@)">SN</div></td>' +
        '            <td class="iscsiaccountuserlabel"><input class="iscsivalidate" id="iscsilunsntargetXlunY" style="width: 215px;" placeholder="Auto Generate" ONCHANGE></td>' +
        '            <td><div class="iscsilabel" onclick="openshowhelp(@iSCSIMode@)">Mode</div></td>' +
        '            <td class="iscsiinterfaceportlabel"><select id="iscsilunmodetargetXlunY" ONCHANGE><option value="online">Online</option><option value="offline">Offline</option><option value="delete">Delete</option></select></td>' +
        '          </tr>' +
        '        </table>' +
        '</div>';

    const lunhtml = rawhtml.replace(/@/g, "'");

    let maxlunid = parseInt(document.getElementById('iscsitarget' + targetid + 'lunsdiv').getAttribute('iscsiluncount'));

    if (maxlunid < parseInt(lunid)) {
        maxlunid = parseInt(lunid);
        document.getElementById('iscsitarget' + targetid + 'lunsdiv').setAttribute('iscsiluncount', maxlunid);
    } else if (lunid == "0") {
        maxlunid++;
        lunid = maxlunid;
        document.getElementById('iscsitarget' + targetid + 'lunsdiv').setAttribute('iscsiluncount', lunid);
    }

    const lunhtmlwithonchange = lunhtml.replace(/ONCHANGE/g, onchange);
    const lunhtmlwithondelete = lunhtmlwithonchange.replace(/ONDELETE/g, ondelete);
    const lunhtmlwithtargetid = lunhtmlwithondelete.replace(/X/g, targetid);
    const lunhtmlwithlunid = lunhtmlwithtargetid.replace(/Y/g, lunid);

    document.getElementById('iscsitarget' + targetid + 'lunsdiv').insertAdjacentHTML('beforeend', lunhtmlwithlunid);
    enableiscsibuttons('iscsitarget');
    return lunid;
}

function iscsiaccountadd() {
    var onchange = 'onchange="';
    onchange += "enableiscsibuttons('iscsiaccount')";
    onchange += '" ';
    var ondelete = 'onchange="';
    ondelete += "iscsideletecheckbox('account','X')";
    ondelete += '" ';

    var rawhtml = '<div class="iscsiaccountcontent" id="iscsiaccountX" iscsiaccountid="X">' +
        '        <table>' +
        '          <tr id="iscsiaccountrowX">' +
        '            <td><div class="iscsilabel" onclick="openshowhelp(@iSCSIUserName@)">User Name</div></td>' +
        '            <td class="iscsiaccountuserlabel"><input name="iscsiXccount" class="iscsivalidate" id="iscsiaccountusernameX" required ONCHANGE"></td>' +
        '            <td><div class="iscsilabel" onclick="openshowhelp(@iSCSIPassword@)">Password</div></td>' +
        '            <td class="iscsiaccountuserlabel"><input name="iscsiaccountX" class="iscsivalidate" id="iscsiaccountpasswordX" required ONCHANGE></td>' +
        '            <td><div class="iscsilabel" onclick="openshowhelp(@iSCSIDelete@)">Delete</div></td>' +
        '            <td class="iscsiinterfaceportlabel"><input type="checkbox" name="iscsiaccountX" class="iscsivalidate" id="iscsiaccountdeleteX" ONDELETE"></td>' +
        '            <td class="hidden"><input id="iscsiaccountloadedpasswordX" class="hidden"></td>' +
        '          </tr>' +
        '        </table>' +
        '</div>';

    const accounthtml = rawhtml.replace(/@/g, "'");
    let nextaccountid = parseInt(document.getElementById('iscsiaccountsdiv').getAttribute('iscsiaccountcount'));
    nextaccountid++;
    const nfsexporthtmlwithonchange = accounthtml.replace(/ONCHANGE/g, onchange);
    const nfsexporthtmlwithondelete = nfsexporthtmlwithonchange.replace(/ONDELETE/g, ondelete);
    const nfsexporthtmlwithid = nfsexporthtmlwithondelete.replace(/X/g, nextaccountid);
    document.getElementById('iscsiaccountsdiv').setAttribute('iscsiaccountcount', nextaccountid);
    document.getElementById('iscsiaccountsdiv').insertAdjacentHTML('beforeend', nfsexporthtmlwithid);
    enableiscsibuttons('iscsiaccount');
    return nextaccountid;
}

function iscsiinterfaceadd() {
    var onchange = 'onchange="';
    onchange += "enableiscsibuttons('iscsiinterface')";
    onchange += '" ';
    var ondelete = 'onchange="';
    ondelete += "iscsideletecheckbox('interface','X')";
    ondelete += '" ';

    var rawhtml = '<div class="iscsiinterfacecontent" id="iscsiinterfaceX" iscsiinterfaceid="X">' +
        '        <table>' +
        '          <tr id="iscsiinterfacerowX">' +
        '            <td><div class="iscsilabel" onclick="openshowhelp(@iSCSIInterfaces@)">Interface</div></td>' +
        '            <td class="iscsiinterfacelabel"><input name="iscsiinterfaceX" class="iscsivalidate" id="iscsiinterfaceaddressX" required ONCHANGE"></td>' +
        '            <td><div class="iscsilabel" onclick="openshowhelp(@iSCSIPort@)">Port</div></td>' +
        '            <td class="iscsiinterfaceportlabel"><input type="number" name="iscsiinterfaceX" class="iscsivalidate" id="iscsiinterfaceportX" min="1024" max="65536" value="3260" required ONCHANGE></td>' +
        '            <td><div class="iscsilabel" onclick="openshowhelp(@iSCSIDelete@)">Delete</div></td>' +
        '            <td class="iscsiinterfaceportlabel"><input type="checkbox" name="iscsiinterfaceX" class="iscsivalidate" id="iscsiinterfacedeleteX" ONDELETE"></td>' +
        '          </tr>' +
        '        </table>' +
        '</div>';

    const interfacehtml = rawhtml.replace(/@/g, "'");
    let nextnterfaceid = parseInt(document.getElementById('iscsiinterfacesdiv').getAttribute('iscsiinterfacecount'));
    nextnterfaceid++;
    const nfsexporthtmlwithonchange = interfacehtml.replace(/ONCHANGE/g, onchange);
    const nfsexporthtmlwithondelete = nfsexporthtmlwithonchange.replace(/ONDELETE/g, ondelete);
    const nfsexporthtmlwithid = nfsexporthtmlwithondelete.replace(/X/g, nextnterfaceid);
    document.getElementById('iscsiinterfacesdiv').setAttribute('iscsiinterfacecount', nextnterfaceid);
    document.getElementById('iscsiinterfacesdiv').insertAdjacentHTML('beforeend', nfsexporthtmlwithid);
    enableiscsibuttons('iscsiinterface');
    return nextnterfaceid;
}

function enablenfsexportbuttons() {

    var nfsexportfolders = document.getElementsByClassName("nfsexportedfolder");
    for (let i = 0; i < nfsexportfolders.length; i++) {
        if (nfsexportfolders[i].checkValidity() == false) {
            document.getElementById('nfsexportsave').className = 'buttondisabled';
            document.getElementById('nfsexportrevert').className = 'buttondisabled';
            return;
        }
    }

    document.getElementById('nfsexportsave').className = 'button';
    document.getElementById('nfsexportrevert').className = 'button';
}

function toggleiamrole(roleentry) {
    var body = document.getElementById(roleentry);

    if (body.style.maxHeight != '0px') {
        body.style.maxHeight = '0px';
        body.style.minHeight = null;
        body.style.overflow = 'hidden';
    } else {
        body.style.maxHeight = body.scrollHeight + 'px';
        body.style.minHeight = body.scrollHeight + 'px';
        body.style.overflow = null;
    }
}


function enablerolebuttons(roletype,roleid) {

    if (document.getElementById(roletype + 'rolename' + roleid).checkValidity() == false || document.getElementById(roletype + "rolepermissions").getAttribute('UpdateRoles') == '0') {
        document.getElementById(roletype + 'rolesave' + roleid).className = 'buttondisabled';
        return;
    }

    document.getElementById(roletype + 'rolesave' + roleid).className = 'button';

    if (document.getElementById(roletype + 'role' + roleid).getAttribute('newrole') == 0) {
        let roleversion = document.getElementById(roletype + 'roleversion' + roleid).value;
        if (roleversion.charAt(2) == '/' && roleversion.charAt(5) == '/' && roleversion.charAt(10) == '.') {
            const date = new Date();
            const VERSIONDATE = date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }) + '.';

            if (roleversion.includes(VERSIONDATE)) {
                let versionincrement = roleversion.substring(11);
                console.log(versionincrement);
                let versionint = parseInt(versionincrement);
                if (versionint == null) {
                    versionincrement = '0';
                } else {
                    versionincrement = versionint + 1;
                }
                let NEWVERSION = VERSIONDATE + versionincrement;
                document.getElementById(roletype + 'roleversion' + roleid).value = NEWVERSION;
            } else {
                let NEWVERSION = VERSIONDATE + '0';
                document.getElementById(roletype + 'roleversion' + roleid).value = NEWVERSION;
            }
        }
        document.getElementById(roletype+ 'role' + roleid).setAttribute('newrole', 2);
    }
}

function deleteiamuser() {
    let OrgUserId = document.getElementById('orguserid').value;
    if (confirm("Are you sure you want to delete user id " + OrgUserId + "?") == true) {
        senddeleteuserrequest(OrgUserId);
    }
}

function createsaveiamuserrequest() {

    let OrgUserId = document.getElementById('orguserid').value;
    let UserId = null;
    let UserName = null;
    let UserRawSecret = null;
    let UserSecretHash = null;
    let UserContentSecret = null;
    let UserEmail = null;
    let UserDescription1 = null;
    let UserDescription2 = null;
    let UserAuthMethod = null;
    let UID = null;
    let GID = null;

    if (document.getElementById('iamedituserid').getAttribute('updated') == '1') {
        UserId = document.getElementById('iamedituserid').value;
    }

    if (document.getElementById('iameditusername').getAttribute('updated') == '1') {
        UserName = document.getElementById('iameditusername').value;
    }

    if (document.getElementById('iameditusersecret').getAttribute('updated') == '1') {
        UserRawSecret = document.getElementById('iameditusersecret').value;
    }

    if (document.getElementById('iameditusercontentsecret').getAttribute('updated') == '1') {
        UserContentSecret = document.getElementById('iameditusercontentsecret').value;
    }

    if (document.getElementById('iamedituseremail').getAttribute('updated') == '1') {
        UserEmail = document.getElementById('iamedituseremail').value;
    }

    if (document.getElementById('iamedituserdescription1').getAttribute('updated') == '1') {
        UserDescription1 = document.getElementById('iamedituserdescription1').value;
    }

    if (document.getElementById('iamedituserdescription2').getAttribute('updated') == '1') {
        UserDescription2 = document.getElementById('iamedituserdescription2').value;
    }

    if (document.getElementById('iamedituserauthmethod').getAttribute('updated') == '1') {
        UserAuthMethod = document.getElementById('iamedituserauthmethod').value;
    }

    if (document.getElementById('iamedituserposixuid').getAttribute('updated') == '1') {
        UID = document.getElementById('iamedituserposixuid').value;
        if ( UID == '' )
        {
          UID='default';
        }
    }

    if (document.getElementById('iamedituserposixgid').getAttribute('updated') == '1') {
        GID = document.getElementById('iamedituserposixgid').value;
        if ( GID == '' )
        {
          GID='default';
        }
    }

    if (UserRawSecret != null) {
        UserSecretHash = new CryptoMD5.MD5(UserRawSecret).toString(CryptoMD5.enc.Hex);
    }

    sendsaveuserrequest(OrgUserId, UserId, UserName, UserSecretHash, UserContentSecret, UserEmail, UserDescription1, UserDescription2, UserAuthMethod, UID, GID);
}

function createaddiamuserrequest() {
    let UserId = document.getElementById('iamedituserid').value;

    let UserName = document.getElementById('iameditusername').value;
    let UserRawSecret = document.getElementById('iameditusersecret').value;
    let UserContentSecret = document.getElementById('iameditusercontentsecret').value;
    let UserEmail = document.getElementById('iamedituseremail').value;
    let UserDescription1 = document.getElementById('iamedituserdescription1').value;
    let UserDescription2 = document.getElementById('iamedituserdescription2').value;
    let UserAuthMethod = document.getElementById('iamedituserauthmethod').value;
    let UID='default';
    if ( document.getElementById('iamedituserposixuid').value != '' )
    {
        UID=document.getElementById('iamedituserposixuid').value;
    }
    let GID='default';
    if ( document.getElementById('iamedituserposixgid').value != '' )
    {
        GID=document.getElementById('iamedituserposixgid').value;
    }
    var UserSecretHash = new CryptoMD5.MD5(UserRawSecret).toString(CryptoMD5.enc.Hex);

    const roleallowed = document.getElementById('iameditusermgmtroleselect');

    let rolesjson = '{ "Roles": [ ';
    let addcomma = '';
    let addpolicy = 0;

    for (let role = 0; role < roleallowed.options.length; role++) {
        if (roleallowed.options[role].selected) {
            rolesjson += addcomma + '"' + roleallowed.options[role].value + '"';
            addcomma = ',';
            addpolicy = 1;
        }
    }
    if (addpolicy == 1) {
        rolesjson += ']}';
    } else {
        rolesjson = null;
    }

    sendcreateuserrequest(UserId, UserName, UserSecretHash, UserContentSecret, UserEmail, UserDescription1, UserDescription2, UserAuthMethod, rolesjson, UID, GID);
}

function iamrolessave(roleid, roletype) {
    let Enabled = 0;
    let addpolicy = 0;
    let policy = '';
    let addcomma = '';

    if (document.getElementById(roletype+'rolename' + roleid).checkValidity == false) {
        return;
    }

    let RoleName = document.getElementById(roletype+'rolename' + roleid).value;
    let Version = document.getElementById(roletype+'roleversion' + roleid).value;
    if (document.getElementById(roletype+'roleenabled' + roleid).checked) {
        Enabled = 1;
    }

    let Statement = '{"Version":"' + Version + '","Statement":[';

    policy = '{';
    if (document.getElementById(roletype+'roleallowedsid' + roleid).value != null) {
        policy += '"Sid": "' + document.getElementById(roletype+'roleallowedsid' + roleid).value + '"';
        addcomma = ',';
        addpolicy = 1;
    }

    policy += addcomma + '"Effect": "Allow"';

    if (document.getElementById(roletype+'rolesallowed' + roleid).value != null) {
        policy += addcomma + '"Action": [';
        addcomma = '';
        const roleallowed = document.getElementById(roletype+'rolesallowed' + roleid);

        for (let role = 0; role < roleallowed.options.length; role++) {
            if (roleallowed.options[role].selected) {
                policy += addcomma + '"' + roleallowed.options[role].value + '"';
                addcomma = ',';
                addpolicy = 1;
            }
        }
        policy += ']}';
    }

    if (addpolicy == 1) {
        Statement += policy;
        addcomma = ',';
    }

    policy = addcomma + '{';
    if (document.getElementById(roletype+'roledeniedsid' + roleid).value != null) {
        policy += '"Sid": "' + document.getElementById(roletype+'roledeniedsid' + roleid).value + '"';
        addcomma = ',';
        addpolicy = 1;
    }

    policy += addcomma + '"Effect": "Deny"';

    if (document.getElementById(roletype+'rolesdenied' + roleid).value != null) {
        policy += addcomma + '"Action": [';
        addcomma = '';
        const roleallowed = document.getElementById(roletype+'rolesdenied' + roleid);

        for (let role = 0; role < roleallowed.options.length; role++) {
            if (roleallowed.options[role].selected) {
                policy += addcomma + '"' + roleallowed.options[role].value + '"';
                addcomma = ',';
                addpolicy = 1;
            }
        }
        policy += ']}';

        if (addpolicy == 1) {
            Statement += policy;
        }
    }

    Statement += ']}';

    let CreateRole = false;

    if (document.getElementById(roletype+'rolesave' + roleid).innerHTML.includes('Create')) {
        CreateRole = true;
    }

    sendsaverolerequest(RoleName, Statement, Version, CreateRole, roleid, Enabled, roletype);
}

function iamrolesadd(roletype,setroleid) {

    const rawrolehtml = '<div class="ROLETYPErolecontent" id="ROLETYPEroleX" ROLETYPErole="X" newrole="1">' +
        '    <div class="iamroleheader">' +
        '        <div class="iamrolename">' +
        '             <input name="ROLETYPEroleX" id="ROLETYPErolenameX" class="iamrolename" onchange="enablerolebuttons(@ROLETYPE@,@X@)"' +
        '                placeholder="Role Name"  required></div>' +
        '        <div class="iamrolecollapsiblebutton" onclick="toggleiamrole(@ROLETYPErolebodyX@)"><img' +
        '                name="ROLETYPErolecollapsiblebuttonicon" id="ROLETYPErolecollapsiblebuttonX" src="MinusIcon.png"></div>' +
        '    </div>' +
        '    <div class="iamrolebody" id="ROLETYPErolebodyX" style="max-height: 0px;">' +
        '        <div class="iamcontentroletable">' +
        '          <table>' +
        '            <tr>' +
        '              <td onclick="openshowhelp(@IamRoleID@)" class="iamrolelabel iamroleid">Role ID</td>' +
        '              <td class="iamroleidinput"><input type="number" name="ROLETYPEroleX" id="ROLETYPEroleidX" placeholder="auto" value="X" disabled></td>' +
        '              <td onclick="openshowhelp(@IamRoleEnabled@)" class="iamrolelabel iamroleenabled">Role Enabled</td>' +
        '              <td class="iamroleenabledcheckbox"><input type="checkbox" id="ROLETYPEroleenabledX" name="ROLETYPEroleX" checked onchange="enablerolebuttons(@ROLETYPE@,@X@)"></td>' +
        '              <td onclick="openshowhelp(@IamRoleVersion@)" class="iamrolelabel iamroleversion">Role Version</td>' +
        '              <td class="iamroleversioninput"><input type="text" name="ROLETYPEroleX" id="ROLETYPEroleversionX" size="35" value="VERSION" onchange="enablerolebuttons(@ROLETYPE@,@X@)"></td>' +
        '            </tr>' +
        '          </table>' +
        '        </div>' +
        '        <br>' +
        '        <div class="iamroleactionstable">' +
        '        <table>' +
        '        <tr>' +
        '          <td onclick="openshowhelp(@IamRoleAllowed@)" class="iamrolelabel">Allowed Actions</td>' +
        '          <td onclick="openshowhelp(@IamRoleDenied@)" class="iamrolelabel">Explicitly Denied Actions</td>' +
        '        </tr>' +
        '        <tr>' +
        '          <td><input type="text" name="ROLETYPEroleX" id="ROLETYPEroleallowedsidX" placeholder="Optional Policy Identifier" size="47" onchange="enablerolebuttons(@ROLETYPE@,@X@)"></td>' +
        '          <td><input type="text" name="ROLETYPEroleX" id="ROLETYPEroledeniedsidX" placeholder="Optional Policy Identifier" size="47" onchange="enablerolebuttons(@ROLETYPE@,@X@)"></td>' +
        '        </tr>' +
        '        <tr>' +
        '          <td class="iamroleactionselect"><select id="ROLETYPErolesallowedX" multiple ONCHANGE></select></td>' +
        '          <td class="iamroleactionselect"><select id="ROLETYPErolesdeniedX" multiple ONCHANGE></select></td>' +
        '        </tr>' +
        '        </table>' +
        '        </div>' +
        '        <br>' +
        '        <div class="iamrolebuttons"><table>' +
        '          <tr>' +
        '            <td>' +
        '              <div id="ROLETYPErolesaveX" class="buttondisabled" style="left:50px;" onclick="iamrolessave(@X@,@ROLETYPE@);"> ' +
        '                <center>Create Role</center> ' +
        '              </div> ' +
        '            </td> ' +
        '            <td> ' +
        '              <div id="ROLETYPEroledeleteX" class="button" style="left:500px; " onclick="deleterole(@ROLETYPE@,@X@);"> ' +
        '                <center>Delete Role</center> ' +
        '              </div> ' +
        '            </td> ' +
        '          </tr> ' +
        '       </table></div>' +
        '    </div>' +
        '    <br>' +
        '</div>';

    const date = new Date();
    const VERSION = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }) + '.0';

    const rolehtml = rawrolehtml.replace(/@/g, "'");
    let rolecount = parseInt(document.getElementById(roletype+'rolesdiv').getAttribute(roletype+'rolecount'));
    let roleid;

    if (setroleid == null) {
        roleid = rolecount + 1;
        document.getElementById(roletype+'rolesdiv').setAttribute(roletype+'rolecount', roleid);
    } else {
        roleid = setroleid;
        if (roleid > rolecount) {
            document.getElementById(roletype+'rolesdiv').setAttribute(roletype+'rolecount', roleid);
        }
    }

    let onchange = 'onchange="';
    onchange += "enablerolessavebutton(ROLETYPE+','+roleid+')";
    onchange += '" ';

    const rolehtmlwithtype = rolehtml.replace(/ROLETYPE/g, roletype);
    const rolehtmlwithonchange = rolehtmlwithtype.replace(/ONCHANGE/, onchange);
    const rolehtmlwithversion = rolehtmlwithonchange.replace(/VERSION/, VERSION);
    const rolehtmlwithid = rolehtmlwithversion.replace(/X/g, roleid);
    document.getElementById(roletype+'rolesdiv').insertAdjacentHTML('beforeend', rolehtmlwithid);

    toggleiamrole(roletype+"rolebody" + roleid);

    if (setroleid == null) {
        updateroleactionselects(roletype,roleid);
    }

    if (document.getElementById(roletype+"rolepermissions").getAttribute('UpdateRoles') == '0') {
        document.getElementById(roletype+"roledelete" + roleid).disabled = true;
        document.getElementById(roletype+"role" + roleid).disabled = true;
        document.getElementById(roletype+"roleenabled" + roleid).disabled = true;
        document.getElementById(roletype+"roleallowedsid" + roleid).disabled = true;
        document.getElementById(roletype+"roledeniedsid" + roleid).disabled = true;
    }

    if (document.getElementById(roletype+"rolepermissions").getAttribute('DeleteRoles') == '0') {
        document.getElementById(roletype+"roledelete" + roleid).disabled = true;
    }

    return roleid;
}



function closeiamuser() {

    if (document.getElementById('iamsaveuserbutton').className == 'button') {
        if (confirm("Are you sure you discard any changes made") == false) {
            return;
        }
    }

    document.getElementById('iamedituserdiv').classList.add('hidden');
    document.getElementById('iameditusersecret').value = '';
    document.getElementById('iameditusercontentsecret').value = '';
}

function iameditvalidate(changed) {

    if (changed != null) {
        document.getElementById(changed).setAttribute('updated', '1');
    }

    if ( document.getElementById('iameditusersecret').value.length > 0 )
    {
        document.getElementById('iameditusersecret').required = true; 
    }
    else
    {
        document.getElementById('iameditusersecret').required = false; 
    }

    if ( document.getElementById('iameditusercontentsecret').value.length > 0 )
    {
        document.getElementById('iameditusercontentsecret').required = true; 
    }
    else
    {
        document.getElementById('iameditusercontentsecret').required = false; 
    }

    if (document.getElementById('iamedituserid').checkValidity() == false ||
        document.getElementById('iameditusername').checkValidity() == false ||
        document.getElementById('iameditusersecret').checkValidity() == false ||
        document.getElementById('iameditusercontentsecret').checkValidity() == false) {
        document.getElementById('iamsaveuserbutton').className = 'buttondisabled';
    } else {
        document.getElementById('iamsaveuserbutton').className = 'button';
    }
}

function saveiamuser() {
    if (document.getElementById('iamsaveuserbutton').className == 'buttondisabled') {
        return;
    }

    if (document.getElementById('iamsaveuserbutton').innerHTML.includes('Create')) {
        createaddiamuserrequest();
        return;
    }

    createsaveiamuserrequest();
}

function resetiameditfieldstatus() {
    document.getElementById('iamedituserid').setAttribute('updated', '0');
    document.getElementById('iamedituserenabled').setAttribute('updated', '0');
    document.getElementById('iameditusername').setAttribute('updated', '0');
    document.getElementById('iameditusersecret').setAttribute('updated', '0');
    document.getElementById('iameditusercontentsecret').setAttribute('updated', '0');
    document.getElementById('iamedituseremail').setAttribute('updated', '0');
    document.getElementById('iamedituserposixuid').setAttribute('updated', '0');
    document.getElementById('iamedituserposixgid').setAttribute('updated', '0');
    document.getElementById('iamedituserdescription1').setAttribute('updated', '0');
    document.getElementById('iamedituserdescription2').setAttribute('updated', '0');
    document.getElementById('iamedituserauthmethod').setAttribute('updated', '0');
    document.getElementById('iameditusermgmtroleselect').setAttribute('updated', '0');
    document.getElementById('iamedituserroleselect').setAttribute('updated', '0');
}

function iamedituser(userid) {
    document.getElementById('iamedituserid').value = '';
    document.getElementById('iamedituserenabled').checked = true;
    document.getElementById('iameditusername').value = '';
    document.getElementById('iameditusersecret').value = '';
    document.getElementById('iameditusercontentsecret').value = '';
    document.getElementById('iamedituseremail').value = '';
    document.getElementById('iamedituserposixuid').value = '';
    document.getElementById('iamedituserposixgid').value = '';
    document.getElementById('iamedituserdescription1').value = '';
    document.getElementById('iamedituserdescription2').value = '';
    document.getElementById('iameditusersecret').required = false;
    document.getElementById('iameditusercontentsecret').required = false;
    document.getElementById('iamedituserauthmethod').value = '0';
    document.getElementById('iamdeleteuserbutton').className = 'button';
    document.getElementById('iamsaveuserbutton').className = 'buttondisabled';
    document.getElementById('iamsaveuserbutton').innerHTML = '<center>Save</center>';
    document.getElementById('iamedituserenabled').disabled = false;
    document.getElementById('iamedituserdiv').classList.remove('hidden');
    document.getElementById('iameditusermgmtroleselect').options.length = 0;
    document.getElementById('iamedituserroleselect').options.length = 0;
    resetiameditfieldstatus();
    if (document.getElementById("useradminpermissions").getAttribute('UpdateUsers') == '1') {
        document.getElementById('iamdeleteuserbutton').className = 'button';
        document.getElementById('closeiamuser').innerHTML = '<center>Cancel</center>';
        setiameditfieldmode(false);
    } else {
        document.getElementById('iamdeleteuserbutton').className = 'buttondisabled';
        document.getElementById('closeiamuser').innerHTML = '<center>Close</center>';
        setiameditfieldmode(true);
    }
    getuser(userid);
}

function setiameditfieldmode(modedisabled) {
    document.getElementById('iamedituserid').disabled = modedisabled;
    document.getElementById('iamedituserenabled').disabled = modedisabled;
    document.getElementById('iameditusername').disabled = modedisabled;
    document.getElementById('iameditusersecret').disabled = modedisabled;
    document.getElementById('iameditusercontentsecret').disabled = modedisabled;
    document.getElementById('iamedituseremail').disabled = modedisabled;
    document.getElementById('iamedituserposixuid').disabled = modedisabled;
    document.getElementById('iamedituserposixgid').disabled = modedisabled;
    document.getElementById('iamedituserdescription1').disabled = modedisabled;
    document.getElementById('iamedituserdescription2').disabled = modedisabled;
    document.getElementById('iamedituserauthmethod').disabled = modedisabled;
}

function iamaccountadd() {
    document.getElementById('iamedituserid').value = '';
    document.getElementById('iamedituserenabled').checked = true;
    document.getElementById('iameditusername').value = '';
    document.getElementById('iameditusersecret').value = '';
    document.getElementById('iameditusercontentsecret').value = '';
    document.getElementById('iamedituserposixuid').value = '';
    document.getElementById('iamedituserposixgid').value = '';
    document.getElementById('iamedituseremail').value = '';
    document.getElementById('iamedituserdescription1').value = '';
    document.getElementById('iamedituserdescription2').value = '';
    document.getElementById('iamedituserauthmethod').value = '0';
    document.getElementById('iameditusersecret').required = false;
    document.getElementById('iameditusercontentsecret').required = false;
    document.getElementById('iamdeleteuserbutton').className = 'buttondisabled';
    document.getElementById('iamsaveuserbutton').className = 'buttondisabled';
    document.getElementById('iamsaveuserbutton').innerHTML = '<center>Create</center>';
    document.getElementById('closeiamuser').innerHTML = '<center>Cancel</center>';
    document.getElementById('iamedituserenabled').disabled = true;
    document.getElementById('iamedituserdiv').classList.remove('hidden');
    resetiameditfieldstatus();
    setiameditfieldmode(false);
    if (document.getElementById("iammgmtrolepermissions").getAttribute('ListManagementRoles') == '1' || document.getElementById("iamcontentrolepermissions").getAttribute('ListContentRoles') == '1' ) {
        getconfig('ListRoles');
    }
}


function iaminsertnewaccount(tablerow, userid, username, enabled) {
    var table = document.getElementById("iamaccountlist");
    var row = table.insertRow(tablerow);
    let cellidx = 0;

    var editiconcell = row.insertCell(cellidx);

    if (document.getElementById("useradminpermissions").getAttribute('GetUser') == '1') {
        editiconcell.innerHTML = '<img src="/editicon.png">';
    }
    cellidx++;

    var useridcell = row.insertCell(cellidx);
    cellidx++;
    var usernamecell = row.insertCell(cellidx);
    cellidx++;
    var userenabledcell = row.insertCell(cellidx);
    cellidx++;

    useridcell.innerHTML = userid;
    usernamecell.innerHTML = username;

    if (enabled == 1) {
        userenabledcell.innerHTML = '<input type="checkbox" checked disabled>';
    } else {
        userenabledcell.innerHTML = '<input type="checkbox" disabled>';
    }

    if (document.getElementById("useradminpermissions").getAttribute('GetUser') == '1') {
        editiconcell.addEventListener("click", function() { iamedituser(userid); });
        row.addEventListener("dblclick", function() { iamedituser(userid); });
    }
}

function loadiamaccounts() {
    getconfig('ListUsers');
}

function nfsexportadd() {
    const rawnfsexporthtml = '<div class="nfsexportcontent" id="nfsexportX" exportid="X">' +
        '    <div class="nfsexportheader">' +
        '        <div class="nfsexportinfo">Export X</div>' +
        '        <div class="nfsexportfolder">' +
        '             <input name="nfsexportX" id="nfsexportfolderX" class="nfsexportedfolder" onchange="enablenfsexportbuttons()"' +
        '                placeholder="Click on Select Folder Icon or Enter Folder to Export" required></div>' +
        '        <div class="nfsexportopenfolderimage"><img src="openfolder.png" onclick="selectfolder(@nfsexportfolderX@)"></div>' +
        '        <div class="nfsexportcollapsiblebutton" onclick="togglenfsexports(@X@)"><img' +
        '                name="nfsexportcollapsiblebuttonicon" id="nfsexportcollapsiblebuttonX" src="MinusIcon.png"></div>' +
        '    </div>' +
        '    <div class="nfsexportbody" id="nfsexportbodyX">' +
        '        <div class="nfsexportlabel nfsexportclients" onclick="openshowhelp(@NFSClients@)">Clients</div>' +
        '        <div class="nfsexportclients"><input name="nfsexportX" id="nfsexportclientsX" value="*" placeholder="*" onchange="enablenfsexportbuttons()"></div>' +
        '        <div class="nfsexportlabel nfsexportaccess" onclick="openshowhelp(@NFSAccess@)">Access</div>' +
        '        <div class="nfsexportaccess">' +
        '            <table>' +
        '                <tr>' +
        '                    <td>' +
        '                        <input type="radio" name="nfsexportrwX" id="exportreadwriteX" value="1" checked onchange="enablenfsexportbuttons()">Read Write' +
        '                        <input type="radio" name="nfsexportrwX" id="exportreadonlyX" value="0" onchange="enablenfsexportbuttons()">Read Only' +
        '                    </td>' +
        '                </tr>' +
        '            </table>' +
        '        </div>' +
        '        <div class="nfsexportlabel nfsexportmappings" onclick="openshowhelp(@NFSMappings@)">Mappings</div>' +
        '        <div class="nfsexportanon nfsexportmappings">' +
        '            Anonymous UID' +
        '            <input type="number" name="nfsexportX" id="nfsexportanonuidX" min="-1" max="65336" value="-1" onchange="enablenfsexportbuttons()">' +
        '            &emsp;Anonymous GID' +
        '            <input type="number" name="nfsexportX" id="nfsexportanongidX" min="-1" max="65336" value="-1" onchange="enablenfsexportbuttons()">' +
        '            &emsp;Squash Mode' +
        '            <select name="nfsexportX" id="nfsexportsquashmodeX" onchange="enablenfsexportbuttons()">' +
        '                <option value="0">Root Squash</option>' +
        '                <option value="1">All Squash</option>' +
        '                <option value="2">No Root Squash</option>' +
        '                <option value="3">No Squash</option>' +
        '            </select>' +
        '        </div>' +
        '        <div class="nfsexportlabel nfsexportsecurity" onclick="openshowhelp(@NFSSecurity@)">Security</div>' +
        '        <div class="nfsexportsecuritycheckbox nfsexportsecurity">' +
        '            <input type="checkbox" id="nfsexportsecuritysysX" name="nfsexportX" value="sys" checked onchange="enablenfsexportbuttons()">sys' +
        '            <input type="checkbox" id="nfsexportsecuritykrb5X" name="nfsexportX" value="krb5" onchange="enablenfsexportbuttons()">krb5' +
        '            <input type="checkbox" id="nfsexportsecuritykrb5iX" name="nfsexportX" value="krb5i" onchange="enablenfsexportbuttons()">krb5i' +
        '            <input type="checkbox" id="nfsexportsecuritykrb5pX" name="nfsexportX" value="krb5p" onchange="enablenfsexportbuttons()">krb5p' +
        '        </div>' +
        '        <div class="nfsexportlabel nfsexportadvanced" onclick="openshowhelp(@NFSAdvanced@)" onchange="enablenfsexportbuttons()">Advanced</div>' +
        '        <div class="nfsexportadvancedcheckbox nfsexportadvanced">' +
        '            <input type="checkbox" id="nfsexportadvancedsubtreecheckX" name="nfsexportX" value="subtree" checked onchange="enablenfsexportbuttons()">Subtree' +
        '            check' +
        '            <input type="checkbox" id="nfsexportadvancedsecurelocksX" name="nfsexportX" value="securelocks" checked onchange="enablenfsexportbuttons()">Secure' +
        '            locks' +
        '            <input type="checkbox" id="nfsexportadvancednowdelayX" name="nfsexportX" value="nowdelay" onchange="enablenfsexportbuttons()">No wdelay' +
        '            <input type="checkbox" id="nfsexportadvancedasyncX" name="nfsexportX" value="nowdelay" onchange="enablenfsexportbuttons()">Async' +
        '            <input type="checkbox" id="nfsexportadvancedrootexportX" name="nfsexportrootexport" value="rootexport" onchange="togglerootexportcheckboxes(this); enablenfsexportbuttons()" enablenfsexportbuttons() ">Root Export' +
        '            <input type="checkbox" id="nfsexportadvancedenabledX" name="nfsexportX" value="exportenabled" checked onchange="enablenfsexportbuttons()">Export' +
        '            Enabled' +
        '            <div name="nfsexportX" class="button" style="left: 580px;position: absolute;top: 3px;"' +
        '                onclick="nfsexportdelete(X);">' +
        '                <center>Delete</center>' +
        '            </div>' +
        '        </div>' +
        '    </div>' +
        '    <br>' +
        '</div>';

    const nfsexporthtml = rawnfsexporthtml.replace(/@/g, "'");
    let nextexportid = parseInt(document.getElementById('nfsexportsdiv').getAttribute('nfsexportcount'));
    nextexportid++;
    const nfsexporthtmlwithid = nfsexporthtml.replace(/X/g, nextexportid);
    document.getElementById('nfsexportsdiv').setAttribute('nfsexportcount', nextexportid);
    document.getElementById('nfsexportsdiv').insertAdjacentHTML('beforeend', nfsexporthtmlwithid);

    togglenfsexports(nextexportid);

    return nextexportid;
}

function nfsexportdelete(exportid) {
    if (confirm("Are you sure you want to delete this nfs export " + exportid + "?") == true) {
        var nfsexport = document.getElementById('nfsexport' + exportid);

        nfsexport.parentNode.removeChild(nfsexport);
        document.getElementById('nfsexportsave').className = 'button';
        document.getElementById('nfsexportrevert').className = 'button';
    }
}

function reloadiammgmtroles() {
    if (confirm("Are you sure you want to reload all IAM Roles from Nexfs?") == true) {
        getconfig('GetManagementRoles');
    }
}
function reloadiamcontentroles() {
    if (confirm("Are you sure you want to reload all Content Roles from Nexfs?") == true) {
        getconfig('GetContentRoles');
    }
}

function reloadnfsexports() {
    if (confirm("Are you sure you want to reload the entire nfs export list from Nexfs?") == true) {
        getconfig('GetNFSExports');
    }
}

function reloadiscsitargets() {
    if (confirm("Are you sure you want to reload the entire iscsi target list from Nexfs?") == true) {
        document.getElementById('iscsitargetsdiv').setAttribute('updating', 'iscsitargets');
        document.getElementById('iscsitargetsdiv').setAttribute('updatingid', '0');
        getconfig('GetISCSIConf');
    }
}

function reloadiscsiinterfaces() {
    if (confirm("Are you sure you want to reload the entire iscsi interface list from Nexfs?") == true) {
        document.getElementById('iscsitargetsdiv').setAttribute('updating', 'iscsiinterfaces');
        document.getElementById('iscsitargetsdiv').setAttribute('updatingid', '0');
        getconfig('GetISCSIConf');
    }
}

function reloadiscsiaccounts() {
    if (confirm("Are you sure you want to reload the entire iscsi account list from Nexfs?") == true) {
        document.getElementById('iscsitargetsdiv').setAttribute('updating', 'iscsiaccounts');
        document.getElementById('iscsitargetsdiv').setAttribute('updatingid', '0');
        getconfig('GetISCSIConf');
    }
}

function refreshiscsiinterfacelist(rowid, updatenext) {
    document.getElementById('iscsitargetsdiv').setAttribute('updating', 'interfacelist');
    document.getElementById('iscsitargetsdiv').setAttribute('updatingid', rowid);
    if (updatenext != "0") {
        document.getElementById('iscsitargetsdiv').setAttribute('updatenext', updatenext);
    }
    getconfig('GetISCSIConf');
}

function refreshiscsiaccountlist(rowid, updatenext) {
    document.getElementById('iscsitargetsdiv').setAttribute('updating', 'accountlist');
    document.getElementById('iscsitargetsdiv').setAttribute('updatingid', rowid);
    if (updatenext != "0") {
        document.getElementById('iscsitargetsdiv').setAttribute('updatenext', updatenext);
    }
    getconfig('GetISCSIConf');
}

function populateiscsiaccountdiv(iscsijson) {
    document.getElementById('iscsiaccountsdiv').setAttribute('iscsiaccountcount', '0');
    document.getElementById('iscsiaccountsdiv').innerHTML = "";

    const iscsiaccountist = iscsijson.accounts;
    const iscsiaccounts = Object.keys(iscsiaccountist);
    iscsiaccounts.forEach(function(entry) {
        let accountid = iscsiaccountadd();
        document.getElementById('iscsiaccountusername' + accountid).value = iscsiaccountist[entry].account.username;
        document.getElementById('iscsiaccountusername' + accountid).required = false;
        document.getElementById('iscsiaccountusername' + accountid).disabled = true;

        document.getElementById('iscsiaccountpassword' + accountid).value = iscsiaccountist[entry].account.password;
        document.getElementById('iscsiaccountloadedpassword' + accountid).value = iscsiaccountist[entry].account.password;
    });

    if (!document.getElementById('iaccountsconfigurationdiv').classList.contains("configloaded")) {
        document.getElementById('iaccountsconfigurationdiv').classList.add("configloaded");
    }
}

function populateiscsiinterfacediv(iscsijson) {
    document.getElementById('iscsiinterfacesdiv').setAttribute('iscsiinterfacecount', '0');
    document.getElementById('iscsiinterfacesdiv').innerHTML = "";

    const iscsiinterfacelist = iscsijson.interfaces;
    const iscsiinterfaces = Object.keys(iscsiinterfacelist);
    iscsiinterfaces.forEach(function(entry) {
        let interfaceid = iscsiinterfaceadd();
        let interfacedetails = iscsiinterfacelist[entry].interface.address.split(':');
        document.getElementById('iscsiinterfaceaddress' + interfaceid).value = interfacedetails[0];
        document.getElementById('iscsiinterfaceaddress' + interfaceid).required = false;
        document.getElementById('iscsiinterfaceaddress' + interfaceid).disabled = true;

        document.getElementById('iscsiinterfaceport' + interfaceid).value = parseInt(interfacedetails[1]);
        document.getElementById('iscsiinterfaceport' + interfaceid).required = false;
        document.getElementById('iscsiinterfaceport' + interfaceid).disabled = true;

    });

    if (!document.getElementById('iinterfacesconfigurationdiv').classList.contains("configloaded")) {
        document.getElementById('iinterfacesconfigurationdiv').classList.add("configloaded");
    }
}

function UpdateNFSExports(nfsexportjson) {
    document.getElementById('nfsexportsdiv').setAttribute('nfsexportcount', '0');
    document.getElementById('nfsexportsdiv').innerHTML = "";

    const nfsexportlist = nfsexportjson.nfsexports;
    const nfsexports = Object.keys(nfsexportlist);
    nfsexports.forEach(function (entry) {
        let newexportid = nfsexportadd();
        document.getElementById('nfsexportfolder' + newexportid).value = nfsexportlist[entry].exportdir;
        document.getElementById('nfsexportclients' + newexportid).value = nfsexportlist[entry].auth;

        if (nfsexportlist[entry].rw == 1) {
            document.getElementById('exportreadwrite' + newexportid).checked = true;
            document.getElementById('exportreadonly' + newexportid).checked = false;
        } else {
            document.getElementById('exportreadwrite' + newexportid).checked = false;
            document.getElementById('exportreadonly' + newexportid).checked = true;
        }
        document.getElementById('nfsexportsecuritysys' + newexportid).checked = Boolean(nfsexportlist[entry].secsys);
        document.getElementById('nfsexportsecuritykrb5' + newexportid).checked = Boolean(nfsexportlist[entry].seckrb5);
        document.getElementById('nfsexportsecuritykrb5i' + newexportid).checked = Boolean(nfsexportlist[entry].seckrb5i);
        document.getElementById('nfsexportsecuritykrb5p' + newexportid).checked = Boolean(nfsexportlist[entry].seckrb5p);
        document.getElementById('nfsexportadvancedenabled' + newexportid).checked = Boolean(nfsexportlist[entry].enabled);
        document.getElementById('nfsexportadvancedasync' + newexportid).checked = Boolean(nfsexportlist[entry].async);
        document.getElementById('nfsexportadvancednowdelay' + newexportid).checked = Boolean(nfsexportlist[entry].nowdelay);
        document.getElementById('nfsexportsquashmode' + newexportid).value = nfsexportlist[entry].squash;
        document.getElementById('nfsexportanonuid' + newexportid).value = nfsexportlist[entry].anonuid;
        document.getElementById('nfsexportanongid' + newexportid).value = nfsexportlist[entry].anongid;
        document.getElementById('nfsexportadvancedsecurelocks' + newexportid).checked = Boolean(nfsexportlist[entry].securelocks);
        document.getElementById('nfsexportadvancedsubtreecheck' + newexportid).checked = Boolean(nfsexportlist[entry].subtree_check);
        document.getElementById('nfsexportadvancedrootexport' + newexportid).checked = Boolean(nfsexportlist[entry].rootexport);

    });

    if (!document.getElementById('nfsexportsdiv').classList.contains("configloaded")) {
        document.getElementById('nfsexportsdiv').classList.add("configloaded");
    }
}

function openshowhelp(helptextattr) {
    document.getElementById('showhelptext').innerHTML = document.getElementById('showhelp').getAttribute(helptextattr);
    document.getElementById('showhelpdiv').classList.remove('hidden');
}

function closeshowhelp() {
    document.getElementById('showhelpdiv').classList.add('hidden');
}

function togglenfsexports(exportrow) {
    var body = document.getElementById('nfsexportbody' + exportrow);

    if (body.style.maxHeight) {
        body.style.maxHeight = null;
        body.style.minHeight = null;
        body.style.overflow = 'hidden';
    } else {
        body.style.maxHeight = body.scrollHeight + 'px';
        body.style.minHeight = body.scrollHeight + 'px';
        body.style.overflow = null;
    }
}

function showconfigurationhelp(e, helpsource, corsource) {
    let helpvalues = document.getElementById(helpsource);
    if ( ! helpvalues.hasAttribute('livevalue')) {
        helpvalues = helpvalues.firstElementChild;
    }   

    document.getElementById('configurationhelplabel').innerHTML = helpvalues.getAttribute('tag');

    if (document.getElementById(helpsource).className == 'firstradio') {
        document.getElementById('configurationhelpname').innerHTML = document.getElementById(helpsource).getAttribute('name');
    } else {
        document.getElementById('configurationhelpname').innerHTML = helpsource;
    }

    if (helpvalues.getAttribute('string') == '1') {
        document.getElementById('configurationhelpstring').innerHTML = 'Yes';
    } else {
        document.getElementById('configurationhelpstring').innerHTML = 'No';
    }

    document.getElementById('configurationlivevalue').innerHTML = helpvalues.getAttribute('livevalue');
    document.getElementById('configurationvalue').innerHTML = helpvalues.getAttribute('configurationvalue');
    document.getElementById('configurationhelpmin').innerHTML = helpvalues.getAttribute('min');
    document.getElementById('configurationhelpmax').innerHTML = helpvalues.getAttribute('max');

    if (helpvalues.getAttribute('restart') == '1') {
        document.getElementById('configurationhelprestart').innerHTML = 'Yes';
    } else {
        document.getElementById('configurationhelprestart').innerHTML = 'No';
    }

    document.getElementById('configurationhelptext').innerHTML = helpvalues.getAttribute('help');

    document.getElementById('configurationhelpdiv').style.left = e.clientX - 20 + 'px';
    document.getElementById('configurationhelpdiv').style.top = e.clientY - 100 + 'px';
    showdiv('configurationhelpdiv');
}

function getSignatureKey(key, dateStamp, regionName, serviceName) {
    var kDate = CryptoHmac.HmacSHA256(dateStamp, "AWS4" + key);
    var kRegion = CryptoHmac.HmacSHA256(regionName, kDate);
    var kService = CryptoHmac.HmacSHA256(serviceName, kRegion);
    var kSigning = CryptoHmac.HmacSHA256("aws4_request", kService);
    return kSigning;
}


function createconfvarsrequest(confdiv) {

    var requestjson;
    var configinputs = document.getElementById(confdiv).getElementsByClassName("configinput");
    var addcomma = 0;


    requestjson = '{ "Configs": [';
    for (let i = 0; i < configinputs.length; i++)
        if ((configinputs[i].tagName == "INPUT") || (configinputs[i].tagName == "SELECT")) {
            if (addcomma == 0)
                addcomma = 1;
            else
                requestjson += ',';

            requestjson += '"' + configinputs[i].id + '"';
        } else if (configinputs[i].tagName == "TD") {
        var tdinputs = configinputs[i].getElementsByClassName("firstradio");
        if (tdinputs[0].tagName == "INPUT") {
            if (addcomma == 0)
                addcomma = 1;
            else
                requestjson += ',';

            requestjson += '"' + tdinputs[0].name + '"';
        }
    }

    requestjson += ' ] }';

    document.getElementById('inprogressdiv').classList.remove("hidden");
    document.getElementById('inprogressdiv').classList.add("visible");
    document.getElementById('update' + confdiv).className = 'buttondisabled';
    document.getElementById('revert' + confdiv).className = 'buttondisabled';
    document.getElementById(confdiv).classList.add('configloaded');
    sendgetconfsreq(requestjson, 2);
}

function changetoplevel2menuselected(e) {
    let tablinks, tabcontent;

    tabcontent = document.getElementsByClassName("storageconfigurationtabdiv");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("toplevel2menutablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    e.currentTarget.className += " active";
    document.getElementById('storage' + e.currentTarget.name + 'configurationdiv').style.display = "inherit";

    if (document.getElementById('storage' + e.currentTarget.name + 'configurationdiv').classList.contains("configloaded")) {
        return;
    }

    createconfvarsrequest('storage' + e.currentTarget.name + 'configurationdiv');

}

function changetopmenuselected(e, section) {
    let tablinks; 

    let tabcontent = document.getElementById(section).getElementsByClassName("configurationtabdiv");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementById(section).getElementsByClassName("topmenutablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    e.currentTarget.className += " active";
    document.getElementById(e.currentTarget.name + 'configurationdiv').style.display = "inherit";

    if (document.getElementById(e.currentTarget.name + 'configurationdiv').classList.contains('storageconfigurationtabdiv')) {
        if (!document.getElementById(e.currentTarget.name + 'configurationdiv').classList.contains("configloaded")) {
            createconfvarsrequest(e.currentTarget.name + 'configurationdiv');
        }
    } else if (e.currentTarget.name == 'iamcontentroles') {
        if (!document.getElementById('iamcontentrolesconfigurationdiv').classList.contains("configloaded")) {
            getconfig('GetContentRoles');
        }
    } else if (e.currentTarget.name == 'iammgmtroles') {
        if (!document.getElementById('iammgmtrolesconfigurationdiv').classList.contains("configloaded")) {
            getconfig('GetManagementRoles');
        }
    } else if (e.currentTarget.name == 'iamaccounts') {
        if (!document.getElementById('iamaccountsconfigurationdiv').classList.contains("configloaded")) {
            getconfig('ListUsers');
        }
    } else if (e.currentTarget.name == 'iinterfaces') {
        if (!document.getElementById('iinterfacesconfigurationdiv').classList.contains("configloaded")) {
            document.getElementById('iscsitargetsdiv').setAttribute('updating', 'iscsiinterfaces');
            document.getElementById('iscsitargetsdiv').setAttribute('updatingid', '0');
            getconfig('GetISCSIConf');
        }
    } else if (e.currentTarget.name == 'iaccounts') {
        if (!document.getElementById('iaccountsconfigurationdiv').classList.contains("configloaded")) {
            document.getElementById('iscsitargetsdiv').setAttribute('updating', 'iscsiaccounts');
            document.getElementById('iscsitargetsdiv').setAttribute('updatingid', '0');
            getconfig('GetISCSIConf');
        }
    }
}

function getiamsubformdata() {
    if (!document.getElementById("iamsecretkeymenu").classList.contains('hidden')) {
        return;
    }

    if (!document.getElementById("iamaccountsmenu").classList.contains('hidden')) {
        loadiamaccounts();
        return;
    }

    if (!document.getElementById("iammgmtrolesmenu").classList.contains('hidden') || !document.getElementById("iamcontentrolesmenu").classList.contains('hidden') ) {
        getconfig('ListRoles');
        return;
    }
}

function selectedsidemenuchange(e) {
    if (e.parentElement.className == "optiondisabled") {
        return;
    }

    if (!e.classList.contains("sidemenuselected")) {
        let sidemenudivs = document.getElementById('sidemenu').getElementsByTagName('div');
        let a;

        for (let i = 0; i < sidemenudivs.length; i++) {
            if (sidemenudivs[i].id != "sessiondetails" && sidemenudivs[i].className != "optiondisabled") {
                sidemenudivs[i].className = "";
                if (document.getElementById(sidemenudivs[i].id + 'div') !== null)
                    document.getElementById(sidemenudivs[i].id + 'div').className = 'paneldiv hidden';
                a = sidemenudivs[i].getElementsByTagName('a');
                a[0].className = "";
            }
        }
        e.className = "sidemenuselected";
        e.parentElement.className = "sidemenuselected";
        document.getElementById(e.parentElement.id + 'div').className = 'paneldiv visible';

        if (e.parentElement.id == "systemstatus") {
            getsystemstatus();
        } else if (e.parentElement.id == "license") {
            getlicensedetails();
        } else if (e.parentElement.id == "iam") {
            getiamsubformdata();
        } else if (e.parentElement.id == "nfs") {
            if (!document.getElementById('nfsexportsdiv').classList.contains("configloaded")) {
                getconfig('GetNFSExports');
            }
        } else if (e.parentElement.id == "iscsi") {
            if (!document.getElementById('itargetsconfigurationdiv').classList.contains("configloaded")) {
                getconfig('GetISCSIConf');
            }
        } else if (e.parentElement.id == "certs") {
            if (!document.getElementById('certsconfigurationdiv').classList.contains("configloaded")) {
                getconfig('ListCertificates');
            }
        }
    }
}

function CloseHttpFailedWindow() {
    document.getElementById('FailedHTTPRequest').style.visibility = 'hidden';
    if (document.getElementById('ReloadonError').innerHTML == "reload")
        location.reload();
}

function updatestatuscirclediv(divid, newstatus) {
    var classname;

    switch (newstatus) {
        case "InERR":
            classname = 'statuscircleerror';
            break;

        case "OK":
        case "LowWaterMark":
        case "Enabled":
        case "FloorWaterMark":
            classname = 'statuscircleok';
            break;

        case "Disabled":
            classname = 'statuscircledisabled';
            break;

        case "InWarn":
        case "HighWaterMark":
        case "Initialising":
            classname = 'statuscirclewarning';
            break;

        default:
            classname = 'nexfsstatusdisabled';
            break;

    }

    if (newstatus.includes('TB'))
        classname = 'nexfsstatusok';

    document.getElementById(divid).innerHTML = newstatus;
    document.getElementById(divid).className = 'statuscircle ' + classname;
}

function updatestatusboxdiv(divid, divtextid, newstatus) {
    var statustext;
    var classname;

    switch (newstatus) {
        case "InERR":
            statustext = 'Error';
            classname = 'nexfsstatuserror';
            break;

        case "Shutdown":
            statustext = 'Shutdown';
            classname = 'nexfsstatuserror';
            break;

        case "OK":
            statustext = 'OK';
            classname = 'nexfsstatusok';
            break;

        case "Idle":
            statustext = 'Idle';
            classname = 'nexfsstatusok';
            break;

        case "LowWaterMark":
            statustext = 'Low Water Mark';
            classname = 'nexfsstatusok';
            break;

        case "Enabled":
            statustext = 'Enabled';
            classname = 'nexfsstatusok';
            break;

        case "FloorWaterMark":
            statustext = 'Floor Water Mark';
            classname = 'nexfsstatusok';
            break;

        case "Disabled":
            statustext = 'Disabled';
            classname = 'nexfsstatusdisabled';
            break;

        case "InWarn":
            statustext = 'Warning';
            classname = 'nexfsstatuswarning';
            break;

        case "Paused":
            statustext = 'Paused';
            classname = 'nexfsstatuswarning';
            break;

        case "HighWaterMark":
            statustext = 'High Water Mark';
            classname = 'nexfsstatuswarning';
            break;

        case "InShutdown":
            statustext = 'In Shutdown';
            classname = 'nexfsstatuswarning';
            break;

        case "Initialising":
            statustext = 'Initialising';
            classname = 'nexfsstatuswarning';
            break;

        case "Unknown":
            statustext = 'Unknown';
            classname = 'nexfsstatusdisabled';
            break;

        case "InProgress":
            statustext = 'In Progress';
            classname = 'nexfsstatuswarning';
            break;

        case "Degraded":
            statustext = 'Degraded';
            classname = 'nexfsstatuswarning';
            break;

        default:
            statustext = newstatus;
            classname = 'nexfsstatuswarning';
            break;

    }

    document.getElementById(divtextid).innerHTML = statustext;
    document.getElementById(divid).className = 'nexfsstatusitem ' + classname;
}

function updatesystemstatustext(statustextid, newtext) {
    document.getElementById(statustextid).innerHTML = newtext;
}

function AutoUpdateSystemStatus() {
    if (document.getElementById('systemstatusdiv').className.includes('visible')) {
        getsystemstatus();
    } else {
        AddUpdateSystemStatusTimer();
    }
}

function DisplayLicenseDetails(currentlicensedetails) {
    const licensedetails = currentlicensedetails.License;

    document.getElementById('licenseversion').innerHTML = licensedetails.Version;
    document.getElementById('licenseid').innerHTML = licensedetails.ID;
    document.getElementById('licenseexpiry').innerHTML = licensedetails.Expiry;
    document.getElementById('licensetype').innerHTML = licensedetails.License;
    document.getElementById('licensecapacity').innerHTML = licensedetails.Capacity;
    document.getElementById('licensetier2').innerHTML = licensedetails.FeatureTier2;
    document.getElementById('licensesmarttier').innerHTML = licensedetails.FeatureSmartTier;
    document.getElementById('licensesmartprotect').innerHTML = licensedetails.FeatureSmartProtect;
    document.getElementById('licensesmartprotectopenfiles').innerHTML = licensedetails.FeatureSmartProtectOpenFiles;
    document.getElementById('licensesmarttieropenfiles').innerHTML = licensedetails.FeatureSmartTierOpenFiles;
    document.getElementById('licensetier3compression').innerHTML = licensedetails.FeatureTier3Compression;
    document.getElementById('licensetier3encryption').innerHTML = licensedetails.FeatureTier3Encryption;
}

let SystemStatusUpdateTimeout;

function AddUpdateSystemStatusTimer() {
    clearTimeout(SystemStatusUpdateTimeout);
    SystemStatusUpdateTimeout = setTimeout(AutoUpdateSystemStatus, 10000);
}

function UpdateSystemStatusErrorLogs(newlogs) {
    const errorlogs = newlogs.LogErrors;

    document.getElementById('systemststauslogerrors').innerHTML = '';

    for (const logmsg of errorlogs) {
        document.getElementById('systemststauslogerrors').innerHTML += logmsg + "<br>";
    }
}

function UpdateSystemStatus(newstatus) {
    const status = newstatus.Status;

    updatestatusboxdiv('statusnexfs', 'statusnexfsservertext', status.ServerStatus);
    updatestatusboxdiv('statusstructurereplication', 'statusstructurereplicationtext', status.StructureReplicationStatus);
    updatestatusboxdiv('statustier1structture', 'statustier1structuretext', status.Tier1StructStatus);
    updatestatusboxdiv('statustier2structture', 'statustier2structuretext', status.Tier2StructStatus);
    updatestatusboxdiv('statustier1data', 'statustier1datatext', status.Tier1Status);
    updatestatusboxdiv('statustier2data', 'statustier2datatext', status.Tier2Status);
    updatestatusboxdiv('statustier1datathreshold', 'statustier1datathresholdtext', status.Tier1ThresholdLevel);
    updatestatusboxdiv('statustier2datathreshold', 'statustier2datathresholdtext', status.Tier2ThresholdLevel);
    updatestatusboxdiv('statustier3', 'statustier3text', status.Tier3Status);
    updatestatusboxdiv('statuscontentserver', 'statuscontentserverstatustext', status.ContentWebServer);
    updatestatusboxdiv('statusiscsi', 'statusiscsitext', status.iSCSIStatus);
    updatestatusboxdiv('statusnfs', 'statusnfstext', status.NFSStatus);
    updatestatuscirclediv('statuscirclemanagedcapacity', status.ManagedCapacity);
    updatestatuscirclediv('statuscircletier1datastorage', status.Tier1Status);
    updatestatuscirclediv('statuscircletier2datastorage', status.Tier2Status);
    updatestatuscirclediv('statuscircletier3datastorage', status.Tier3Status);
    updatesystemstatustext('statushostname', status.Hostname);
    updatesystemstatustext('statussoftwarerelease', status.Release);
    updatesystemstatustext('statussoftwareexpires', status.SoftwareExpires);
    updatesystemstatustext('statuslicense', status.License);
    updatesystemstatustext('statusuptime', status.Uptime);
    updatesystemstatustext('statusmountpoint', status.MountPoint);
    updatesystemstatustext('statusjobscheduler', status.JobScheduler);
    updatesystemstatustext('statusbgmigrations', status.BGMigrationScheduler);
    updatesystemstatustext('statusdeletionscheduler', status.DeletionScheduler);
}

function togglerootexportcheckboxes(e) {
    if (e.checked == false) {
        return;
    }

    var rootexportcheckboxes = document.getElementsByName("nfsexportrootexport");

    for (let i = 0; i < rootexportcheckboxes.length; i++) {
        rootexportcheckboxes[i].checked = false;
    }

    e.checked = true;
}

function togglefileselectedrow(selectedrow) {

    if (document.getElementById(selectedrow).classList.contains('selectedfilelistrow')) {
        return;
    }

    var filelistingrows = document.getElementById('fileselectlist').getElementsByClassName("selectedfilelistrow");

    for (let i = 0; i < filelistingrows.length; i++) {
        filelistingrows[i].className = ('notselectedfilelistrow');
    }

    document.getElementById(selectedrow).classList.remove('notselectedfilelistrow');
    document.getElementById(selectedrow).classList.add('selectedfilelistrow');

    if (document.getElementById('fileselectmode').value == "1" && document.getElementById(selectedrow).getAttribute('entrytype') == 'directory') {
        document.getElementById('returnfileselected').className = "buttondisabled";
    } else {
        document.getElementById('returnfileselected').className = "button";
    }
}

function closefileselect() {
    document.getElementById('fileselectlist').innerHTML = "";
    document.getElementById('fileselectnextpath').value = "";
    document.getElementById('fileselectcurrentpath').value = "";
    document.getElementById('returnfileselected').className = "buttondisabled";
    document.getElementById('fileselectcurrentfolder').value = "";
    document.getElementById('fileselecttargetid').value = "";
    document.getElementById('fileselectdiv').className = "fileselect hidden";
}

function returnfileselect() {
    var thepath = document.getElementById('fileselectnextpath').value;
    var selectedlisting = document.getElementById('fileselectlist').getElementsByClassName("selectedfilelistrow");
    let selectedvalue; 

    if (selectedlisting.length == 0) {
        selectedvalue = thepath;
        thepath = '';
        if (selectedvalue.length > 1 && selectedvalue[selectedvalue.length - 1] == '/') {
            selectedvalue = selectedvalue.substring(0, selectedvalue.length - 1);
        }
    } else {
        var fileselectentry = document.getElementById(selectedlisting[0].id + 'value');
        selectedvalue = fileselectentry.innerHTML;
    }
    var targetinput = document.getElementById('fileselecttargetid').value;

    if (selectedvalue == '/') {
        selectedvalue = '';
    }

    document.getElementById(targetinput).value = thepath + selectedvalue;

    if (document.getElementById('fileselecttargetid').value.includes('nfsexportfolder')) {
        enablenfsexportbuttons();
    } else if (document.getElementById('fileselecttargetid').value.includes('iscsilunpathtarget')) {
        enableiscsibuttons('iscsitarget');
    }

    closefileselect();
}


function updatefileselect(filelistjson) {
    const thepath = document.getElementById('fileselectnextpath').value;
    const dirlisting = filelistjson.Listing;
    const listingentries = Object.keys(dirlisting).sort();
    const currententry = document.getElementById('fileselectedentry').value;
    const fileselectcurrentfolder = thepath;
    var depth = parseInt(document.getElementById('fileselectdepth').value);
    let entryclass = 'notselectedfilelistrow';
    document.getElementById('returnfileselected').className = "buttondisabled";

    let listingtable = '<table id="filelisttable">';

    if (currententry == "/") {
        entryclass = 'selectedfilelistrow';
        document.getElementById('returnfileselected').className = "button";
    }

    if (thepath == '/') {
        let onclickentry = '"filelistrownexfsroot"';
        listingtable += "<tr id='filelistrownexfsroot' class='" + entryclass + "' onclick='togglefileselectedrow(" + onclickentry + ")'><td class='fileselecttypeicon'><img src='/folderwithlogo.png'></td><td id='filelistrownexfsrootvalue' class='fileselectentry'>/</td></tr>";
        entryclass = 'notselectedfilelistrow';
    } else {
        let quotedcurrententry; 
        if (fileselectcurrentfolder.length > 1) {
            quotedcurrententry = '"' + fileselectcurrentfolder + '"';
        } else {
            quotedcurrententry = '""';
        }
        listingtable += "<tr id='filelistrowshowpartent' class='notselectedfilelistrow' ondblclick='downdirlisting(" + quotedcurrententry + ")'><td class='fileselecttypeicon'><img src='/folderwithbackarrow.png' onclick='downdirlisting(" + quotedcurrententry + ")'></td><td class='fileselectentry'>..</td></tr>";
    }

    listingentries.forEach(function(entry) {
        if (depth == 0) {
            if (entry == currententry) {
                entryclass = 'selectedfilelistrow';
                document.getElementById('returnfileselected').className = "button";
            } else {
                entryclass = 'notselectedfilelistrow';
            }
        }

        listingtable += "<tr name='fileentry' id='filelistrow" + entry + "' class='" + entryclass + "' onclick='togglefileselectedrow(";
        let onclickentry = '"filelistrow' + entry + '"';
        listingtable += onclickentry;


        if (dirlisting[entry].Type == 'dir') {
            listingtable += ")' entrytype='directory'";
            var chgdir = "ondblclick='updirlisting(";
            let onclickentry = '"' + fileselectcurrentfolder + entry + '/"';
            chgdir += onclickentry;
            chgdir += ")'";
            listingtable += chgdir;
            chgdir = chgdir.replace("ondblclick", "onclick");
            listingtable += "><td class='fileselecttypeicon'><img src='/folderwithforwardarrow.png'";
            listingtable += chgdir;
        } else {
            listingtable += ")' entrytype='file'";
            listingtable += "><td class='fileselecttypeicon'><img src='/fileblueicon.png'";
        }

        listingtable += "></td><td id='filelistrow" + entry + "value' class='fileselectentry'>" + entry + "</td></tr>";
    });

    listingtable += '</table>';

    document.getElementById('fileselectlist').innerHTML = listingtable;
    /* document.getElementById('fileselectcurrentpath').value = thepath; */
    document.getElementById('fileselectcurrentfolder').value = thepath;
}

function completegetconfsrequest(confjson) {
    const configs = confjson.Configs;
    const configkeys = Object.keys(configs);

    configkeys.forEach(function(key) {
        const targetinput = document.getElementById(key);
        let thetarget;

        if (targetinput != null) {
            if (targetinput.tagName == "INPUT") {
                thetarget = targetinput;

                if (thetarget.type == 'checkbox') {
                    if (configs[key].ConfigValue == "0") {
                        thetarget.checked = false;
                    } else {
                        thetarget.checked = true;
                    }
                } else if (thetarget.type == 'time') {
                    if (configs[key].ConfigValue.length == 1) {
                        thetarget.value = '00:0' + configs[key].ConfigValue;
                    } else if (configs[key].ConfigValue.length == 2) {
                        thetarget.value = '00:' + configs[key].ConfigValue;
                    } else if (configs[key].ConfigValue.length == 3) {
                        thetarget.value = '0' + configs[key].ConfigValue[0] + ':' + configs[key].ConfigValue[1] + configs[key].ConfigValue[2];
                    } else if (configs[key].ConfigValue.length == 4) {
                        thetarget.value = configs[key].ConfigValue[0] + configs[key].ConfigValue[1] + ':' + configs[key].ConfigValue[2] + configs[key].ConfigValue[3];
                    }
                } else {
                    thetarget.value = configs[key].ConfigValue;
                }
                thetarget.setAttribute('livevalue', configs[key].LiveValue);
                thetarget.setAttribute('configurationvalue', configs[key].ConfigValue);
            } else if (targetinput.tagName == "SELECT") {
                thetarget = targetinput;
                thetarget.value = configs[key].ConfigValue;
                thetarget.setAttribute('livevalue', configs[key].LiveValue);
                thetarget.setAttribute('configurationvalue', configs[key].ConfigValue);
            } else if (targetinput.tagName == "TD") {
                document.getElementById(key + configs[key].ConfigValue).checked = true;
                thetarget = document.getElementById(key + '0');
                thetarget.setAttribute('livevalue', configs[key].LiveValue);
                thetarget.setAttribute('configurationvalue', configs[key].ConfigValue);
            }

            if ( configs[key].LiveValue !== configs[key].ConfigValue ) {
              thetarget.classList.add('configinputhighlight');
            }
            else {
              thetarget.classList.remove('configinputhighlight');
            }

            if (configs[key].String == '1') {
                thetarget.maxlength = configs[key].Max;
            }
            thetarget.setAttribute('tag', configs[key].Tag);
            thetarget.setAttribute('help', configs[key].Help);
            thetarget.setAttribute('string', configs[key].String);
            thetarget.setAttribute('min', configs[key].Min);
            thetarget.setAttribute('max', configs[key].Max);
            thetarget.setAttribute('restart', configs[key].Restart);
        }
    });
}

function saveformconfvars(confform) {
    let vartoupdate = 0;
    var varname;
    var newvalue;
    var restart;

    if (document.getElementById('update' + confform).classList.contains("buttondisabled")) {
        return;
    }

    var json = '{ "Configs": [ ';

    let forminput = Array.from(document.getElementById(confform).getElementsByTagName('input'));
    let formselects = Array.from(document.getElementById(confform).getElementsByTagName('select'));
    const forminputs = forminput.concat(formselects);

    for (let i = 0; i < forminputs.length; i++) {
        if (forminputs[i].getAttribute('configurationvalue') != forminputs[i].value || forminputs[i].type == 'radio' || forminputs[i].type == 'checkbox') {
            if (forminputs[i].type == 'radio') {
                if (forminputs[i].className != 'firstradio') {
                    continue;
                }
                let radios = document.getElementsByName(forminputs[i].name);
                newvalue = forminputs[i].getAttribute('configurationvalue');

                let ii;
                for ( ii = 0; ii < radios.length; ii++) {
                    if (radios[ii].checked == true) {
                        newvalue = radios[ii].value;
                        break;
                    }
                }

                if (ii == radios.length) {
                    continue;
                }

                varname = forminputs[i].name;
                restart = forminputs[i].getAttribute('restart');
            } else if (forminputs[i].type == 'checkbox') {
                if (forminputs[i].checked == false) {
                    newvalue = "0";
                } else {
                    newvalue = "1";
                }


                varname = forminputs[i].id;
                restart = forminputs[i].getAttribute('restart');
            } else if (forminputs[i].type == 'time') {
                varname = forminputs[i].id;
                newvalue = parseInt(forminputs[i].value[0] + forminputs[i].value[1] + forminputs[i].value[3] + forminputs[i].value[4]);
                restart = forminputs[i].getAttribute('restart');
            } else {
                varname = forminputs[i].id;
                newvalue = forminputs[i].value;
                restart = forminputs[i].getAttribute('restart');
            }

            if (newvalue == forminputs[i].getAttribute('configurationvalue')) {
                continue;
            }

            if (vartoupdate == 1) {
                json += ',';
            }

            if ( (varname === "CONTENTWEBSERVERMAXCONNECTIONS" || varname == "CONTENTWEBSERVERMAXSERVERS") && document.getElementById('statuscontentserverstatustext').innerHTML == "OK" )
            {
                restart=1;
            }

            json += '{ "VarName": "' + varname + '",';
            json += '"NewValue": "' + newvalue + '",';
            json += '"UpdateMode": "';
            if (restart == '1') {
                json += '1';
            } else {
                json += '3';
            }
            json += '"}';
            vartoupdate = 1;
        }
    }
    json += '] }';

    if (vartoupdate == 1) {
        UpdateConfigs(json, confform);
    } else {
        createconfvarsrequest(confform);
    }
}

function attachchildtoparent(childelement, parentelement) {
    document.getElementById(parentelement).appendChild(document.getElementById(childelement));
}

function detachchildformparent(childelement, parentelement) {
    document.getElementById(parentelement).removeChild(document.getElementById(childelement));
}

function toggleadvancedsection(caller, childelement, visibleparentelement, hiddenparentelement) {
    let childElement = document.getElementById(childelement);

    if (document.getElementById(caller).innerHTML.includes('Show')) {
        document.getElementById(hiddenparentelement).removeChild(childElement);
        document.getElementById(visibleparentelement).appendChild(childElement);
        document.getElementById(caller).innerHTML = 'Hide Advanced Settings';
    } else {
        document.getElementById(visibleparentelement).removeChild(childElement);
        document.getElementById(hiddenparentelement).appendChild(childElement);
        document.getElementById(caller).innerHTML = 'Show Advanced Settings';
    }
}

function validateconfigform(formtovalidate) {
    document.getElementById('revert' + formtovalidate).className = 'button';
    let forminputs = document.getElementById(formtovalidate).getElementsByTagName('input');


    for (let i = 0; i < forminputs.length; i++) {
        if (forminputs[i].getAttribute('validate') == 'true') {
            if (forminputs[i].checkValidity() == false) {
                document.getElementById('update' + formtovalidate).className = 'buttondisabled';
                return;
            }
        }
    }
    document.getElementById('update' + formtovalidate).className = 'button';
}

function setfileditdefault() {
    document.getElementById('editfilename').value = '';
    document.getElementById('editfilename').required = true;
    document.getElementById('editfilesize').value = '0';
    document.getElementById('editfilesize').required = true;
    document.getElementById('editfilechunksize').value = '';
    document.getElementById('editfilechunksize').required = false;
    document.getElementById('editfileowner').value = '';
    document.getElementById('editfilegroup').value = '';
    document.getElementById('editfileownerread').checked = true;
    document.getElementById('editfileownerwrite').checked = true;
    document.getElementById('editfileownerexecute').checked = false;
    document.getElementById('editfilegroupread').checked = true;
    document.getElementById('editfilegroupwrite').checked = true;
    document.getElementById('editfilegroupexecute').checked = false;
    document.getElementById('editfileotherread').checked = false;
    document.getElementById('editfileotherwrite').checked = false;
    document.getElementById('editfileotherexecute').checked = false;
    document.getElementById('fileeditparentfolder').value = '';
    document.getElementById('orgeditfilename').value = '';
    document.getElementById('saveeditfilebutton').innerHTML = '<center>Save</center>';
}

function closeeditfile() {
    setfileditdefault();
    document.getElementById('fileeditdiv').classList.add('hidden');
}

function createfileselect() {
    setfileditdefault();
    document.getElementById('saveeditfilebutton').innerHTML = '<center>Create</center>';
    document.getElementById('fileeditdiv').classList.remove('hidden');
    document.getElementById('fileeditparentfolder').value = document.getElementById('fileselectcurrentfolder').value;
}

function validatefileedit() {

    if (document.getElementById('editfilename').checkValidity() == false || document.getElementById('editfilesize').checkValidity() == false || document.getElementById('editfilechunksize').checkValidity() == false) {
        document.getElementById('saveeditfilebutton').className = 'buttondisabled';
    } else {
        document.getElementById('saveeditfilebutton').className = 'button';
    }
}

function ifcheckedenablevrequired(checkelements, valiationelements, validatevalue, validateform, formtovalidate) {
    const celements = checkelements.split(",");
    const velements = valiationelements.split(",");
    let validate = 0;

    for (let i = 0; i < celements.length; i++) {
        if (document.getElementById(celements[i]).checked == validatevalue) {
            validate = 1;
            break;
        }
    }

    if (validate == 0) {
        for (let i = 0; i < velements.length; i++) {
            document.getElementById(velements[i]).setAttribute('validate', 'false');
        }
    } else {
        for (let i = 0; i < velements.length; i++) {
            document.getElementById(velements[i]).setAttribute('validate', 'true');
        }
    }

    if (validateform == true) {
        validateconfigform(formtovalidate);
    }
}

function makeformelementsreadonly(confform) {

    let forminputs = document.getElementById(confform).getElementsByTagName('input');

    for (let i = 0; i < forminputs.length; i++) {
        forminputs[i].disabled = true;
    }
}

function makeformelementschangeable(confform) {

    let forminputs = document.getElementById(confform).getElementsByTagName('input');

    for (let i = 0; i < forminputs.length; i++) {
        forminputs[i].disabled = false;
    }
}

function ActivateSessionPermissions(sessionpermissions) {
    let enabledmenu = 0;
    const optiondisableforms = ['storageindexconfigurationdiv', 'storagetier1configurationdiv', 'storagetier2configurationdiv', 'storagetier3configurationdiv',
        'storageservicemanagementconfigurationdiv', 'storagescheduledmigrationsconfigurationdiv'
    ];
    const optionconfenableforms = ['storageindexconfigurationdiv', 'storagetier1configurationdiv', 'storagetier2configurationdiv', 'storagetier3configurationdiv',
        'storagescheduledmigrationsconfigurationdiv'
    ];
    const optionids = ['systemstatus', 'nexfsconfiguration', 'nfs', 'iscsi', 'license', 'servicemanagement', 'pausenexfs', 'enableiscsi', 'enablenfs', 'managenfs', 'iam', 'certs'];


    for (let optionform of optiondisableforms) {
        makeformelementsreadonly(optionform);
    }

    for (let optionid of optionids) {
        if (document.getElementById(optionid) != null) {
            document.getElementById(optionid).classList.add("optiondisabled");
        }
    }

    document.getElementById("filepermissions").setAttribute('ListDirectories', '0');
    document.getElementById("filepermissions").setAttribute('ListFiles', '0');
    document.getElementById("filepermissions").setAttribute('CreateDirectories', '0');
    document.getElementById("filepermissions").setAttribute('CreateFiles', '0');
    document.getElementById("iammgmtrolepermissions").setAttribute('ListManagementRoles', '0');
    document.getElementById("iammgmtrolepermissions").setAttribute('DeleteRoles', '0');
    document.getElementById("iammgmtrolepermissions").setAttribute('UpdateRoles', '0');
    document.getElementById("iamcontentrolepermissions").setAttribute('DeleteRoles', '0');
    document.getElementById("iamcontentrolepermissions").setAttribute('UpdateRoles', '0');
    document.getElementById("iamcontentrolepermissions").setAttribute('ListContentRoles', '0');
    document.getElementById("iammgmtrolesadd").className = 'buttondisabled';
    document.getElementById("iammgmtrolesmenu").classList.add('hidden');
    document.getElementById("iamcontentrolesadd").className = 'buttondisabled';
    document.getElementById("iamcontentrolesmenu").classList.add('hidden');
    document.getElementById("useradminpermissions").setAttribute('GetUser', '0');
    document.getElementById("useradminpermissions").setAttribute('UpdateUsers', '0');
    document.getElementById("iamaccountsmenu").classList.add('hidden');
    document.getElementById("iamsecretkeymenu").classList.add('hidden');
    document.getElementById("iameditusersecret").disabled = true;
    document.getElementById("iameditusersecret").required = false;
    document.getElementById("iameditusercontentsecret").disabled = true;
    document.getElementById("iameditusercontentsecret").required = false;
    document.getElementById("iamaccountadd").className = 'buttondisabled';

    const actions = sessionpermissions.Statement.find(e => e.Effect == 'Allow').Action;

    for (const action of actions) {
        if (action == 'nexfs:GetSystemStatus') {
            document.getElementById('systemstatus').classList.remove("optiondisabled");
            getsystemstatus();
        } else if (action == 'nexfs:GetConfiguration') {
            document.getElementById('nexfsconfiguration').classList.remove("optiondisabled");
            createconfvarsrequest('storageindexconfigurationdiv');
        } else if (action == 'nexfs:UpdateConfiguration') {
            for (const enableform of optionconfenableforms) {
                makeformelementschangeable(enableform);
            }
        } else if (action == 'nfs:GetConfiguration') {
            document.getElementById('nfs').classList.remove("optiondisabled");
        } else if (action == 'nfs:ManageSubSystem') {
            document.getElementById('NFSENABLED').disabled = false;
            document.getElementById('NFSSTARTSTOP').disabled = false;
        } else if (action == 'nfs:GetSubSystem') {
            document.getElementById('enablenfs').classList.remove("optiondisabled");
            document.getElementById('managenfs').classList.remove("optiondisabled");
            document.getElementById('servicemanagement').classList.remove("optiondisabled");
        } else if (action == 'iscsi:GetConfiguration') {
            document.getElementById('iscsi').classList.remove("optiondisabled");
        } else if (action == 'iscsi:ManageSubSystem') {
            document.getElementById('ISCSIENABLED').disabled = false;
        } else if (action == 'iscsi:GetSubSystem') {
            document.getElementById('enableiscsi').classList.remove("optiondisabled");
            document.getElementById('servicemanagement').classList.remove("optiondisabled");
        } else if (action == 'nexfs:ManageCertificate') {
            document.getElementById('certs').classList.remove("optiondisabled");
        } else if (action == 'nexfs:GetLicenseDetails') {
            document.getElementById('license').classList.remove("optiondisabled");
        } else if (action == 'nexfs:UpdateLicense') {
            document.getElementById('licensereplace').className = 'button';
        } else if (action == 'iam:GetManagementRoles') {
            document.getElementById('iam').classList.remove("optiondisabled");
            getconfig('ListAllManagementActions');
        } else if (action == 'nexfs:GetContentRoles') {
            document.getElementById('iam').classList.remove("optiondisabled");
            getconfig('ListAllContentActions');
        } else if (action == 'nexfs:PauseServer') {
            document.getElementById('servicemanagement').classList.remove("optiondisabled");
            document.getElementById('NEXFSPAUSED').disabled = false;
            document.getElementById('pausenexfs').classList.remove("optiondisabled");
        } else if (action == 'nexfs:ListDirectories') {
            document.getElementById("filepermissions").setAttribute('ListDirectories', '1');
        } else if (action == 'nexfs:ListFiles') {
            document.getElementById("filepermissions").setAttribute('ListFiles', '1');
        } else if (action == 'nexfs:CreateDirectories') {
            document.getElementById("filepermissions").setAttribute('CreateDirectories', '1');
        } else if (action == 'nexfs:CreateFiles') {
            document.getElementById("filepermissions").setAttribute('CreateFiles', '1');
        } else if (action == 'iam:ListUsers') {
            document.getElementById('iam').classList.remove("optiondisabled");
            document.getElementById("iamaccountsmenu").classList.remove('hidden');
        } else if (action == 'iam:GetUser') {
            document.getElementById('iam').classList.remove("optiondisabled");
            document.getElementById("useradminpermissions").setAttribute('GetUser', '1');
        } else if (action == 'iam:UpdateUsers') {
            document.getElementById('iam').classList.remove("optiondisabled");
            document.getElementById("useradminpermissions").setAttribute('UpdateUsers', '1');
            document.getElementById("iamaccountadd").className = 'button';
        } else if (action == 'iam:UpdateOtherUserSecret') {
            document.getElementById('iam').classList.remove("optiondisabled");
            document.getElementById("iameditusersecret").disabled = false;
            document.getElementById("iamaccountadd").className = 'button';
        } else if (action == 'iam:UpdateOtherUserContentSecret') {
            document.getElementById('iam').classList.remove("optiondisabled");
            document.getElementById("iameditusercontentsecret").disabled = false;
            document.getElementById("iamaccountadd").className = 'button';
        } else if (action == 'iam:UpdateOwnSecret') {
            document.getElementById('iam').classList.remove("optiondisabled");
            document.getElementById("iamsecretkeymenu").classList.remove('hidden');
        } else if (action == 'nexfs:DeleteContenttRoles') {
            document.getElementById('iam').classList.remove("optiondisabled");
            document.getElementById("iamcontentrolepermissions").setAttribute('DeleteRoles', '1');
        } else if (action == 'iam:DeleteManagementRoles') {
            document.getElementById('iam').classList.remove("optiondisabled");
            document.getElementById("iammgmtrolepermissions").setAttribute('DeleteRoles', '1');
        } else if (action == 'iam:ListManagementRoles') {
            document.getElementById('iam').classList.remove("optiondisabled");
            document.getElementById("iammgmtrolesmenu").classList.remove('hidden');
            document.getElementById("iammgmtrolepermissions").setAttribute('ListManagementRoles', '1');
        } else if (action == 'nexfs:ListContentRoles') {
            document.getElementById('iam').classList.remove("optiondisabled");
            document.getElementById("iamcontentrolesmenu").classList.remove('hidden');
            document.getElementById("iamcontentrolepermissions").setAttribute('ListContentRoles', '1');
        } else if (action == 'nexfs:UpdateContentRoles') {
            document.getElementById('iam').classList.remove("optiondisabled");
            document.getElementById("iamcontentrolepermissions").setAttribute('UpdateRoles', '1');
            document.getElementById("iamcontentrolesadd").className = 'button';
        } else if (action == 'iam:UpdateManagementRoles') {
            document.getElementById('iam').classList.remove("optiondisabled");
            document.getElementById("iammgmtrolepermissions").setAttribute('UpdateRoles', '1');
            document.getElementById("iammgmtrolesadd").className = 'button';
        }
    }

    if (document.getElementById('havesession').value == "0") {
        for (let optionid of optionids) {
            var option = document.getElementById(optionid);
            if (option != null) {
                if (option.classList.contains('optiondisabled')) {
                    option.parentNode.removeChild(option);
                    if (option.Id == 'servicemanagement') {
                        document.getElementById('storagescheduledmigrationsconfigurationdiv').style.display = "inherit";
                        createconfvarsrequest('storagescheduledmigrationsconfigurationdiv');
                    }
                } else if (enabledmenu == 0 && optionid != null) {
                    document.getElementById(optionid + 'div').className = 'paneldiv visible';
                    enabledmenu = 1;
                } else if (optionid !== null) {
                    if (document.getElementById(optionid + 'div') !== null)
                        document.getElementById(optionid + 'div').className = 'paneldiv hidden';
                }
            }
        }
        document.getElementById('havesession').value = "1";
    }

}

function UpdateCurrentLicenseDetails() {
    let RequestStatus = this;

    if (RequestStatus.readyState == RequestStatus.DONE) {
        if (RequestStatus.status != 200) {
            var responsetext = RequestStatus.responseText;
            if (responsetext.includes('<Code>InvalidSecurity</Code>') || responsetext.includes('<Code>ExpiredToken</Code>')) {
                document.getElementById('login').style.visibility = 'visible';
                return;
            }
            document.getElementById('FailedHTTPRequestText').innerHTML = RequestStatus.responseText;
            document.getElementById('FailedHTTPRequest').style.visibility = 'visible';
        } else {
            const licensejson = JSON.parse(RequestStatus.responseText);
            const livelicense = licensejson.NEXFSLICENSEKEY;

            document.getElementById('currentlicensekey').innerHTML = livelicense.LiveValue;
        }
    }
}

function RequestComplete() {
    let RequestStatus = this;

    if (RequestStatus.readyState == RequestStatus.DONE) {
        document.getElementById('inprogressdiv').classList.remove("visible");
        document.getElementById('inprogressdiv').classList.add("hidden");

        if (RequestStatus.status != 200) {
            var responsetext = RequestStatus.responseText;
            if (responsetext.includes('<Code>InvalidSecurity</Code>') || responsetext.includes('<Code>ExpiredToken</Code>')) {
                document.getElementById('login').style.visibility = 'visible';
                return;
            } else if (responsetext.includes('<Code>BadRequest</Code>') && responsetext.includes('<Message>The requested directory does not exist</Message>')) {
                if (document.getElementById('fileselectnextpath').value != '/') {
                    document.getElementById('fileselectdepth').value = "0";
                    dirlisting('/');
                    return;
                }
            }
            document.getElementById('FailedHTTPRequestText').innerHTML = RequestStatus.responseText;
            document.getElementById('FailedHTTPRequest').style.visibility = 'visible';
        } else {
            let requesturl = RequestStatus.responseURL;

            if (requesturl.includes('Action=RevokeSessionToken'))
                location.reload();
            else if (requesturl.includes('Action=GetSessionPermissions')) {
                ActivateSessionPermissions(JSON.parse(RequestStatus.responseText));
                createconfvarsrequest('storageservicemanagementconfigurationdiv');
            } else if (requesturl.includes('Action=GetSystemStatus')) {
                UpdateSystemStatus(JSON.parse(RequestStatus.responseText));
                geterrorlogs();
            } else if (requesturl.includes('Action=GetErrorLog')) {
                UpdateSystemStatusErrorLogs(JSON.parse(RequestStatus.responseText));
                AddUpdateSystemStatusTimer();
            } else if (requesturl.includes('Action=GetLicenseDetails')) {
                DisplayLicenseDetails(JSON.parse(RequestStatus.responseText));
            } else if (requesturl.includes('Action=GetConfigs')) {
                completegetconfsrequest(JSON.parse(RequestStatus.responseText));
            } else if (requesturl.includes('Action=UpdateConfigs')) {
                if (document.getElementById('reloadconfdiv').innerHTML !== null) {
                    if ( document.getElementById('reloadconfdiv').innerHTML == 'certificatedetails' )
                    {
                        document.getElementById('certificatedetailsdiv').className = 'hidden';
                        document.getElementById('certificateupdate').className = 'buttondisabled';
                        getconfig('ListCertificates');
                    }
                    else
                    {
                      var reloadconfdiv = document.getElementById('reloadconfdiv').innerHTML;
                      document.getElementById('reloadconfdiv').innerHTML = "";
                      createconfvarsrequest(reloadconfdiv);
                    }
                }
            } else if (requesturl.includes('Action=GetDirectoryListing')) {
                document.getElementById('fileselectdiv').classList.remove("hidden");
                updatefileselect(JSON.parse(RequestStatus.responseText));
            } else if (requesturl.includes('Action=UpdateConfig')) {
                if (document.getElementById('inprogresshidediv').innerHTML !== null) {
                    document.getElementById(document.getElementById('inprogresshidediv').innerHTML).className = 'hidden';
                    if (document.getElementById('inprogresshidediv').innerHTML == 'updatelicensediv') {
                        getlicensedetails();
                    }
                }
            } else if (requesturl.includes('Action=GetManagementRoles')) {
                completeiamgetrolesrequest('iammgmt',JSON.parse(RequestStatus.responseText));
            } else if (requesturl.includes('Action=GetContentRoles')) {
                completeiamgetrolesrequest('iamcontent',JSON.parse(RequestStatus.responseText));
            } else if (requesturl.includes('Action=DeleteRole')) {
                completeiamroledeleterequest(RequestStatus.responseXML);
            } else if (requesturl.includes('Action=CreateRole')) {
                if (requesturl.includes('RoleType=iam')) {
                  completeiamrolecreaterequest(RequestStatus.responseXML,'iammgmt');
                }
                else
                {
                  completeiamrolecreaterequest(RequestStatus.responseXML,'iamcontent');
                }
            } else if (requesturl.includes('Action=SaveRole')) {
                if (requesturl.includes('RoleType=iam')) {
                  completeiamrolesaverequest(RequestStatus.responseXML,'iammgmt');
                }
                else
                {
                  completeiamrolesaverequest(RequestStatus.responseXML,'iamcontent');
                }
            } else if (requesturl.includes('Action=ListRoles')) {
                completeiamgetmgmtlistrolesrequest(RequestStatus.responseXML);
            } else if (requesturl.includes('Action=ChangePassword')) {
                clearchangesecretkeyform();
            } else if (requesturl.includes('Action=GetUser')) {
                completeiamgetmgmtgetuserrequest(RequestStatus.responseXML);
            } else if (requesturl.includes('Action=CreateUser')) {
                completeiamgetmgmtcreateuserrequest('CreateUser');
            } else if (requesturl.includes('Action=DeleteUser')) {
                completeiamgetmgmtcreateuserrequest('DeleteUser');
            } else if (requesturl.includes('Action=UpdateUser')) {
                completeiamgetmgmtupdateuserrequest();
            } else if (requesturl.includes('Action=ListUsers')) {
                completeiamgetmgmtlistusersrequest(RequestStatus.responseXML);
            } else if (requesturl.includes('Action=ListAllManagementActions')) {
                storemanagmentactions(JSON.parse(RequestStatus.responseText));
            } else if (requesturl.includes('Action=ListAllContentActions')) {
                storecontentactions(JSON.parse(RequestStatus.responseText));
            } else if (requesturl.includes('Action=GetISCSIConf')) {
                completeiscsigetrequest(JSON.parse(RequestStatus.responseText));
            } else if (requesturl.includes('Action=PutISCSIConf')) {
                completeiscsiputrequest();
            } else if (requesturl.includes('Action=PutNFSExports')) {
                document.getElementById('nfsexportsave').className = 'buttondisabled';
                document.getElementById('nfsexportrevert').className = 'buttondisabled';
            } else if (requesturl.includes('Action=GetNFSExports')) {
                UpdateNFSExports(JSON.parse(RequestStatus.responseText));
            } else if (requesturl.includes('Action=CreateFolder')) {
                completecreatefolder();
            } else if (requesturl.includes('Action=CreateFile')) {
                completecreatefile();
            } else if (requesturl.includes('Action=PutCertificate')) {
                completeputcertificate();
            } else if (requesturl.includes('Action=ListCertificates')) {
                completelistcertificates(RequestStatus.responseXML);
            }
            else if (requesturl.includes('Action=GetCertificate')) {
                completeloadcertificate(RequestStatus.responseXML);
            }
            else if (requesturl.includes('Action=DeleteCertificate')) {
                completedeletecertificate(RequestStatus.responseXML);
            }
        }
    }

}

function targetaddoption(theselect, thevalue, selected, multiselect) {
    let newoption = document.createElement("option");

    newoption.value = thevalue;
    newoption.text = thevalue;
    if (selected) {
        newoption.setAttribute("bound", "1");
        newoption.selected = true;
    }

    document.getElementById(theselect).add(newoption);

    if (multiselect) {
        newoption.addEventListener("mousedown",
            function(e) {
                e.preventDefault();

                if (this.selected == true) {
                    this.selected = false;
                } else {
                    this.selected = true;
                }
                enableiscsitargetbuttons();
                return false;
            }, false);
    }
}

function enableiscsitargetbuttons() {
    enableiscsibuttons('iscsitarget');
}


function updateroleactionselects(roletype, roleid) {

    let optionfound = 0;
    let roleactions;
    const actionselects = [roletype+"rolesallowed" + roleid, roletype + "rolesdenied" + roleid];

    if (roletype == 'iammgmt' ) 
    {
      roleactions=mgmtactions;
    }
    else if ( roletype == 'iamcontent' )
    {
        roleactions=contentactions;
    }

    for (let i = 0; i < actionselects.length; i++) {
        roleactions.forEach(function(entry) {

            optionfound = 0;
            Array.from(document.querySelector("#" + actionselects[i]).options).forEach(function(option_element) {

                if (option_element.value == entry) {
                    optionfound = 1;
                }
            });

            if (optionfound == 0) {
                let newoption = document.createElement("option");
                newoption.value = entry;
                newoption.text = entry;
                document.getElementById(actionselects[i]).add(newoption);

                newoption.addEventListener("mousedown",
                    function(e) {
                        var el = e.target;
                        e.preventDefault();
                        if (document.getElementById(roletype + "rolepermissions").getAttribute('UpdateRoles') == '0') {
                            return;
                        }

                        var scrollTop = el.parentNode.scrollTop;
                        if (this.selected == true) {
                            this.selected = false;
                        } else {
                            this.selected = true;
                        }
                        enablerolebuttons(roletype, roleid);
                        el.parentNode.scrollTop = scrollTop;
                        return false;
                    }, false);
            }
        });

        var selectidx = 0;

        Array.from(document.querySelector("#" + actionselects[i]).options).forEach(function(option_element) {
            selectidx++;
            optionfound = 0;
            roleactions.forEach(function(entry) {
                if (option_element.value == entry) {
                    optionfound = 1;
                }
            });

            if (optionfound == 0) {
                document.getElementById(actionselects[i]).remove(selectidx - 1);
            }
        });
    }
}

function roleactionoption(theactionselect, theactionvalue, roleid, roletype, selected, multiselect) {
    let newoption = document.createElement("option");

    newoption.value = theactionvalue;
    newoption.text = theactionvalue;
    if (selected) {
        newoption.selected = true;
    }

    document.getElementById(theactionselect).add(newoption);

    if (multiselect) {
        newoption.addEventListener("mousedown",
            function(e) {
                e.preventDefault();

                if (this.selected == true) {
                    this.selected = false;
                } else {
                    this.selected = true;
                }
                enablerolebuttons(roletype, roleid);
                return false;
            }, false);
    }
}

function completeiamrolecreaterequest(response, roletype) {
    let RequestCompleted = response.getElementsByTagName("RequestCompleted")[0];
    let CreateRoleResponse = RequestCompleted.getElementsByTagName("CreateRoleResponse")[0];
    let CreateRoleResult = CreateRoleResponse.getElementsByTagName("CreateRoleResult")[0];
    let Role = CreateRoleResult.getElementsByTagName("Role")[0];
    let roleid = Role.getElementsByTagName("RoleId")[0].childNodes[0].nodeValue;

    document.getElementById(roletype+'rolesave' + roleid).innerHTML = "<center>Save Role</center>";
    document.getElementById(roletype+'rolesave' + roleid).className = "buttondisabled";
    document.getElementById(roletype+'role' + roleid).setAttribute('newrole', 0);
}

function completeiamrolesaverequest(response, roletype) {
    let RequestCompleted = response.getElementsByTagName("RequestCompleted")[0];
    let CreateRoleResponse = RequestCompleted.getElementsByTagName("SaveRoleResponse")[0];
    let CreateRoleResult = CreateRoleResponse.getElementsByTagName("SaveRoleResult")[0];
    let Role = CreateRoleResult.getElementsByTagName("Role")[0];
    let roleid = Role.getElementsByTagName("RoleId")[0].childNodes[0].nodeValue;

    document.getElementById(roletype+'rolesave' + roleid).className = "buttondisabled";
    document.getElementById(roletype+'role' + roleid).setAttribute('newrole', 0);
}

function addmgmtroletoiamedituser(therole, selected, theselect) {
    let iamroleselect = document.getElementById(theselect);
    let newoption = document.createElement("option");
    newoption.value = therole;
    newoption.text = newoption.value;
    newoption.selected = selected;

    if (selected) {
        newoption.setAttribute('wasselected', '1');
    } else {
        newoption.setAttribute('wasselected', '0');
    }

    newoption.addEventListener("mousedown",
        function(e) {
            var el = e.target;
            e.preventDefault();
            var scrollTop = el.parentNode.parentNode.scrollTop;

            let selectedcount = parseInt(el.parentNode.getAttribute('selectedcount'));

            if (this.selected == true) {
                this.selected = false;
                selectedcount--;
            } else {
                if (selectedcount < 16) {
                    this.selected = true;
                    selectedcount++;
                }
            }
            el.parentNode.setAttribute('selectedcount', selectedcount);
            iameditvalidate();
            el.parentNode.parentNode.scrollTop = scrollTop;
            return false;
        }, false);

    iamroleselect.add(newoption);
}

function completeiamgetmgmtlistrolesrequest(response) {
    let RequestCompleted = response.getElementsByTagName("RequestCompleted")[0];
    let ListRolesResponse = RequestCompleted.getElementsByTagName("ListRolesResponse")[0];
    let ListRolesResults = ListRolesResponse.getElementsByTagName("ListRolesResults")[0];
    let RoleList = ListRolesResults.getElementsByTagName("Roles")[0];
    let members = RoleList.getElementsByTagName("member");

    let iammgmtroleselect = document.getElementById('iameditusermgmtroleselect');
    let iamcontentroleselect = document.getElementById('iamedituserroleselect');

    for (let role = 0; role < members.length; role++) {
        let rolefound = 0;
        for (let loop = 0; loop < iammgmtroleselect.options.length; loop++) {
            if ( members[role].getElementsByTagName('Path')[0].childNodes[0].nodeValue.startsWith("/iam/") )
            {
              if (iammgmtroleselect.options[loop].value == members[role].getElementsByTagName('RoleName')[0].childNodes[0].nodeValue) {
                  rolefound = 1;
                  break;
              }
            }
        }
        if (rolefound == 0 && members[role].getElementsByTagName('Path')[0].childNodes[0].nodeValue.startsWith("/iam/") )  {
            addmgmtroletoiamedituser(members[role].getElementsByTagName('RoleName')[0].childNodes[0].nodeValue, false,'iameditusermgmtroleselect');
        }
    }

    for (let role = 0; role < members.length; role++) {
        let rolefound = 0;
        for (let loop = 0; loop < iamcontentroleselect.options.length; loop++) {
            if ( members[role].getElementsByTagName('Path')[0].childNodes[0].nodeValue.startsWith("/s3/") )
            {
              if (iamcontentroleselect.options[loop].value == members[role].getElementsByTagName('RoleName')[0].childNodes[0].nodeValue) {
                  rolefound = 1;
                  break;
              }
            }
        }

        if (rolefound == 0 && members[role].getElementsByTagName('Path')[0].childNodes[0].nodeValue.startsWith("/s3/") )  {
            addmgmtroletoiamedituser(members[role].getElementsByTagName('RoleName')[0].childNodes[0].nodeValue, false,'iamedituserroleselect');
        }
    }

    for (let loop = iammgmtroleselect.options.length - 1; loop >= 0; loop--) {
        let rolefound = 0;

        for (let role = 0; role < members.length; role++) {
            if (iammgmtroleselect.options[loop].value == members[role].getElementsByTagName('RoleName')[0].childNodes[0].nodeValue && 
                members[role].getElementsByTagName('Path')[0].childNodes[0].nodeValue.startsWith("/iam/")) {
                rolefound = 1;
                break;
            }
        }

        if (rolefound == 0) {
            iammgmtroleselect.remove(loop);
        }
    }

    for (let loop = iamcontentroleselect.options.length - 1; loop >= 0; loop--) {
        let rolefound = 0;

        for (let role = 0; role < members.length; role++) {
            if (iamcontentroleselect.options[loop].value == members[role].getElementsByTagName('RoleName')[0].childNodes[0].nodeValue && 
                members[role].getElementsByTagName('Path')[0].childNodes[0].nodeValue.startsWith("/s3/")) {
                rolefound = 1;
                break;
            }
        }

        if (rolefound == 0) {
            iamcontentroleselect.remove(loop);
        }
    }
}

function completeiamgetmgmtupdateuserrequest() {
    document.getElementById('iamedituserdiv').classList.add('hidden');
    document.getElementById('iameditusersecret').value = '';
    document.getElementById('iameditusercontentsecret').value = '';
    loadiamaccounts();

    const UserId = document.getElementById('iamedituserid').value;
    const mgmtroles = document.getElementById('iameditusermgmtroleselect');

    for (let role = 0; role < mgmtroles.options.length; role++) {
        let rolewasselected = mgmtroles.options[role].getAttribute('wasselected');

        if (mgmtroles.options[role].selected && rolewasselected == "0") {
            sendattachuserrole(UserId, mgmtroles.options[role].value, 'iam');
        } else if ((!mgmtroles.options[role].selected) && rolewasselected == "1") {
            senddetachuserrole(UserId, mgmtroles.options[role].value, 'iam');
        }
    }

    const roles = document.getElementById('iamedituserroleselect');

    for (let role = 0; role < roles.options.length; role++) {
        let rolewasselected = roles.options[role].getAttribute('wasselected');

        if (roles.options[role].selected && rolewasselected == "0") {
            sendattachuserrole(UserId, roles.options[role].value, 'user' );
        } else if ((!roles.options[role].selected) && rolewasselected == "1") {
            senddetachuserrole(UserId, roles.options[role].value, 'user' );
        }
    }
    
}


function completeiamgetmgmtcreateuserrequest(requesttype) {
    document.getElementById('iamedituserdiv').classList.add('hidden');
    document.getElementById('iameditusersecret').value = '';
    document.getElementById('iameditusercontentsecret').value = '';
    loadiamaccounts();

    if ( requesttype === 'CreateUser' ) {
        const UserId = document.getElementById('iamedituserid').value;
        const roles = document.getElementById('iamedituserroleselect');
    
        for (let role = 0; role < roles.options.length; role++) {
            let rolewasselected = roles.options[role].getAttribute('wasselected');
    
            if (roles.options[role].selected && rolewasselected == "0") {
                sendattachuserrole(UserId, roles.options[role].value, 'user' );
            } else if ((!roles.options[role].selected) && rolewasselected == "1") {
                senddetachuserrole(UserId, roles.options[role].value, 'user' );
            }
        }
    }

}

function completeiamgetmgmtgetuserrequest(response) {
    let RequestCompleted = response.getElementsByTagName("RequestCompleted")[0];
    let GetUserResponse = RequestCompleted.getElementsByTagName("GetUserResponse")[0];
    let GetUserResult = GetUserResponse.getElementsByTagName("GetUserResult")[0];
    let User = GetUserResult.getElementsByTagName("User")[0];
    /* let Roles = User.getElementsByTagName("Roles")[0]; */

    document.getElementById('iamedituserid').value = User.getElementsByTagName('UserId')[0].childNodes[0].nodeValue;
    document.getElementById('orguserid').value = User.getElementsByTagName('UserId')[0].childNodes[0].nodeValue;

    if (User.getElementsByTagName('UserEnabled')[0].childNodes[0].nodeValue == '1') {
        document.getElementById('iamedituserenabled').checked = true;
    } else {
        document.getElementById('iamedituserenabled').checked = false;
    }

    document.getElementById('iameditusername').value = User.getElementsByTagName('UserName')[0].childNodes[0].nodeValue;

    if (User.getElementsByTagName('UserPOSIXUID')[0].childNodes.length > 0) {
        document.getElementById('iamedituserposixuid').value = User.getElementsByTagName('UserPOSIXUID')[0].childNodes[0].nodeValue;
    }

    if (User.getElementsByTagName('UserPOSIXGID')[0].childNodes.length > 0) {
        document.getElementById('iamedituserposixgid').value = User.getElementsByTagName('UserPOSIXGID')[0].childNodes[0].nodeValue;
    }

    if (User.getElementsByTagName('UserEmail')[0].childNodes.length > 0) {
        document.getElementById('iamedituseremail').value = User.getElementsByTagName('UserEmail')[0].childNodes[0].nodeValue;
    }

    if (User.getElementsByTagName('UserDescription1')[0].childNodes.length > 0) {
        document.getElementById('iamedituserdescription1').value = User.getElementsByTagName('UserDescription1')[0].childNodes[0].nodeValue;
    }

    if (User.getElementsByTagName('UserDescription2')[0].childNodes.length > 0) {
        document.getElementById('iamedituserdescription2').value = User.getElementsByTagName('UserDescription2')[0].childNodes[0].nodeValue;
    }
    document.getElementById('iamedituserauthmethod').value = User.getElementsByTagName('AuthenicationMethod')[0].childNodes[0].nodeValue;

    let contentroles = User.getElementsByTagName('Roles')[0].getElementsByTagName('Role');
    let mgmtroles = User.getElementsByTagName('Roles')[0].getElementsByTagName('MgmtRole');
    document.getElementById('iameditusermgmtroleselect').options.length = 0;
    document.getElementById('iamedituserroleselect').options.length = 0;

    for (let loop = 0; loop < mgmtroles.length; loop++) {
        addmgmtroletoiamedituser(mgmtroles[loop].childNodes[0].nodeValue, true,'iameditusermgmtroleselect');
    }

    for (let loop = 0; loop < contentroles.length; loop++) {
        addmgmtroletoiamedituser(contentroles[loop].childNodes[0].nodeValue, true,'iamedituserroleselect');
    }

    if (document.getElementById("iammgmtrolepermissions").getAttribute('ListManagementRoles') == '1' || document.getElementById("iamcontentrolepermissions").getAttribute('ListContentRoles') == '1' ) {
        getconfig('ListRoles');
    }

}

function completeiamgetmgmtlistusersrequest(response) {
    let RequestCompleted = response.getElementsByTagName("RequestCompleted")[0];
    let ListUsersResponse = RequestCompleted.getElementsByTagName("ListUsersResponse")[0];
    let ListUsersResults = ListUsersResponse.getElementsByTagName("ListUsersResults")[0];
    let UserList = ListUsersResults.getElementsByTagName("Users")[0];
    let members = UserList.getElementsByTagName("member");

    if (!document.getElementById('iamaccountsconfigurationdiv').classList.contains("configloaded")) {
        document.getElementById('iamaccountsconfigurationdiv').classList.add("configloaded");
    }

    let iamaccounttable = document.getElementById('iamaccountlist');

    while (iamaccounttable.rows.length > 1) {
        iamaccounttable.deleteRow(1);
    }

    for (let user = 0; user < members.length; user++) {
        let UserId = members[user].getElementsByTagName('UserId')[0].childNodes[0].nodeValue;
        let UserName = members[user].getElementsByTagName('UserName')[0].childNodes[0].nodeValue;
        let UserEnabled = parseInt(members[user].getElementsByTagName('UserEnabled')[0].childNodes[0].nodeValue);
        iaminsertnewaccount(-1, UserId, UserName, UserEnabled);
    }
}

function completeiamroledeleterequest(response) {
    let roleid = response.getElementsByTagName("RequestCompleted")[0].getElementsByTagName("RoleId")[0].childNodes[0].nodeValue;
    let roletype = response.getElementsByTagName("RequestCompleted")[0].getElementsByTagName("RoleType")[0].childNodes[0].nodeValue; 
    let role;
    
    if ( roletype === "user" )
    {
      role = document.getElementById('iamcontentrole' + roleid);
    }
    else
    {
      role = document.getElementById('iammgmtrole' + roleid);
    }

    role.parentNode.removeChild(role);
}

function deleterole(roletype,roleid) {
    if (confirm("Are you sure you want to delete roleid " + roleid + "?") == false) {
        return;
    }
    let therole = document.getElementById(roletype+ 'role' + roleid);

    if (therole.getAttribute('newrole') == '0') {
        senddeleterole(roletype, document.getElementById(roletype+'rolename' + roleid).value, document.getElementById(roletype+'roleversion' + roleid).value);
        return;
    }
    else
    {
       therole.parentNode.removeChild(therole); 
    }
}


function completeiamgetrolesrequest(roletype, rolesjson) {
    const roleslist = rolesjson.Roles;

    if (roleslist == null) {
        return;
    }

    document.getElementById(roletype+'rolesdiv').innerHTML = '';

    /* const iamroles = Object.keys(roleslist); */

    for (let role = 0; role < roleslist.length; role++) {
        let roleid = iamrolesadd(roletype,roleslist[role].RoleId);
        let actionbox = '';
        document.getElementById(roletype+'rolename' + roleid).value = roleslist[role].RoleName;
        document.getElementById(roletype+'role' + roleid).setAttribute('newrole', '0');
        if (roleslist[role].Enabled == '1') {
            document.getElementById(roletype+'roleenabled' + roleid).checked = true;
        } else {
            document.getElementById(roletype+'roleenabled' + roleid).checked = false;
        }
        document.getElementById(roletype+'roleversion' + roleid).value = roleslist[role].Policy.Version;
        for (let statement = 0; statement < roleslist[role].Policy.Statement.length; statement++) {
            if (roleslist[role].Policy.Statement[statement].Effect == 'Allow') {
                document.getElementById(roletype+'roleallowedsid' + roleid).value = roleslist[role].Policy.Statement[statement].Sid;
                actionbox = roletype+'rolesallowed' + roleid;
            } else if (roleslist[role].Policy.Statement[statement].Effect == 'Deny') {
                document.getElementById(roletype+'roledeniedsid' + roleid).value = roleslist[role].Policy.Statement[statement].Sid;
                actionbox = roletype + 'rolesdenied' + roleid;
            } else {
                continue;
            }

            for (let action = 0; action < roleslist[role].Policy.Statement[statement].Action.length; action++) {
                roleactionoption(actionbox, roleslist[role].Policy.Statement[statement].Action[action], roleid, roletype, true, true);
            }
        }
        updateroleactionselects(roletype,roleid);
        document.getElementById(roletype + 'rolesave' + roleid).innerHTML = '<center>Save Role</center>';
    }

    if (!document.getElementById(roletype+'rolesconfigurationdiv').classList.contains("configloaded")) {
        document.getElementById(roletype+'rolesconfigurationdiv').classList.add("configloaded");
    }
}

function updateiscsitargets(iscsijson) {
    const iscsitargetlist = iscsijson.itargets;

    if (iscsitargetlist == null) {
        return;
    }

    const iscsitargets = Object.keys(iscsitargetlist);
    const iscsibindingslist = iscsijson.bindings;
    let iscsibindings;

    if (iscsibindingslist != null) {
        iscsibindings = Object.keys(iscsibindingslist);
    } else {
        iscsibindings = [];
    }
    var lunid = 0;

    document.getElementById('iscsitargetsdiv').innerHTML = "";
    document.getElementById('iscsitargetsdiv').setAttribute('iscsitargetcount', '0');
    document.getElementById('iscsitargetsdiv').setAttribute('updatenext', '0');
    document.getElementById('iscsitargetsdiv').setAttribute('updating', 'all');


    for (let target = 0; target < iscsitargets.length; target++) {
        let targetid = iscsitargetadd(iscsitargetlist[target].itarget.tid);

        if (iscsitargetlist[target].itarget.headerdigest == 'on') {
            document.getElementById('iscsitargetheaderdigest' + targetid).checked = true;
        }
        if (iscsitargetlist[target].itarget.datadigest == 'on') {
            document.getElementById('iscsitargetdatadigest' + targetid).checked = true;
        }

        const targetlunslist = iscsitargetlist[target].itarget.luns;
        const targetluns = Object.keys(targetlunslist);

        for (let lun = 0; lun < targetluns.length; lun++) {
            lunid = targetlunslist[lun].lun;
            iscsitargetlunadd(targetid, lunid);
            document.getElementById('iscsilunpathtarget' + targetid + 'lun' + lunid).value = targetlunslist[lun].path;
            document.getElementById('iscsilunsntarget' + targetid + 'lun' + lunid).value = targetlunslist[lun].sn;

            document.getElementById('iscsilunmodetarget' + targetid + 'lun' + lunid).addEventListener("change", enableiscsitargetbuttons());
            document.getElementById('iscsilunmodetarget' + targetid + 'lun' + lunid).options.length = 0;
            document.getElementById('iscsilunmodetarget' + targetid + 'lun' + lunid).options[0] = new Option("Online", "online", false, false);
            document.getElementById('iscsilunmodetarget' + targetid + 'lun' + lunid).options[1] = new Option("Offline", "offline", false, false);

            if (targetlunslist[lun].mode == 'offline')
                document.getElementById('iscsilunmodetarget' + targetid + 'lun' + lunid).options[2] = new Option("Delete", "delete", false, false);

            document.getElementById('iscsilunmodetarget' + targetid + 'lun' + lunid).value = targetlunslist[lun].mode;
        }

    }

    for (let thebinding = 0; thebinding < iscsibindings.length; thebinding++) {
        var binding = iscsibindingslist[thebinding].binding.bindto;
        var bindtocount = binding.length;

        let targetid = iscsibindingslist[thebinding].binding.tid;
        for (let bindto = 0; bindto < bindtocount; bindto++) {
            targetaddoption('iscsitargetinterfaces' + targetid, binding[bindto].address, true, true);
        }

        var accountbinding = iscsibindingslist[thebinding].binding.accounts;
        var bindingaccountcount = accountbinding.length;

        for (let account = 0; account < bindingaccountcount; account++) {
            if (accountbinding[account].mode == 'add') {
                targetaddoption('iscsiinboundaccounts' + targetid, accountbinding[account].username, true, true);
            } else {
                targetaddoption('iscsitargetaccounts' + targetid, accountbinding[account].username, true, true, false);
            }
        }
    }

    for (let target = 0; target < iscsitargets.length; target++) {
        document.getElementById('iscsitargetsdiv').setAttribute('updatingid', iscsitargetlist[target].itarget.tid);
        updateiscsiinterfacelistselect(iscsijson);
        updateiscsiaccountlistselect(iscsijson);
    }

    document.getElementById('iscsitargetsdiv').setAttribute('updatingid', '0');

    if (!document.getElementById('itargetsconfigurationdiv').classList.contains("configloaded")) {
        document.getElementById('itargetsconfigurationdiv').classList.add("configloaded");
    }
}

var mgmtactions = [];

function storemanagmentactions(actionjson) {

    let themgmtactions = [];
    const actionlist = actionjson.Actions;

    for (let action = 0; action < actionlist.length; action++) {
        themgmtactions[action] = actionlist[action];
    }
    mgmtactions = themgmtactions.sort();
}

var contentactions = [];

function storecontentactions(actionjson) {

    let thecontentactions = [];
    const actionlist = actionjson.Actions;

    for (let action = 0; action < actionlist.length; action++) {
        thecontentactions[action] = actionlist[action];
    }
    contentactions = thecontentactions.sort();
}

function updateiscsiaccountlistselect(iscsijson) {
    var updaterow = document.getElementById('iscsitargetsdiv').getAttribute('updatingid');

    if (updaterow == '0') {
        return;
    }

    var optionfound = 0;
    const accountselects = ["iscsitargetaccounts", "iscsiinboundaccounts"];
    const iscsiaccountlist = iscsijson.accounts;
    const iscsiaccounts = Object.keys(iscsiaccountlist);
    for (let i = 0; i < accountselects.length; i++) {
        iscsiaccounts.forEach(function(entry) {

            optionfound = 0;
            Array.from(document.querySelector("#" + accountselects[i] + updaterow).options).forEach(function(option_element) {

                if (option_element.value == iscsiaccountlist[entry].account.username) {
                    optionfound = 1;
                }
            });

            if (optionfound == 0) {
                let newoption = document.createElement("option");
                newoption.value = iscsiaccountlist[entry].account.username;
                newoption.text = iscsiaccountlist[entry].account.username;
                newoption.setAttribute("bound", "0");
                document.getElementById(accountselects[i] + updaterow).add(newoption);

                if (accountselects[i] != 'n0n3xfs0utb0undacc0unt') {
                    newoption.addEventListener("mousedown",
                        function(e) {
                            e.preventDefault();

                            if (this.selected == true) {
                                this.selected = false;
                            } else {
                                this.selected = true;
                            }
                            enableiscsibuttons('iscsitarget');
                            return false;
                        }, false);
                }
            }
        });

        var selectidx = 0;

        Array.from(document.querySelector("#" + accountselects[i] + updaterow).options).forEach(function(option_element) {
            selectidx++;
            optionfound = 0;
            iscsiaccounts.forEach(function(entry) {
                if (option_element.value == iscsiaccountlist[entry].account.username) {
                    optionfound = 1;
                }
            });

            if (optionfound == 0 && option_element.value != 'n0n3xfs0utb0undacc0unt') {
                document.getElementById(accountselects[i] + updaterow).remove(selectidx - 1);
            }
        });
    }
}

function updateiscsiinterfacelistselect(iscsijson) {
    var updaterow = document.getElementById('iscsitargetsdiv').getAttribute('updatingid');

    if (updaterow == '0') {
        return;
    }

    var interfacecount = 0;
    var optionfound = 0;
    const iscsiinterfacelist = iscsijson.interfaces;
    const iscsiinterfaces = Object.keys(iscsiinterfacelist);
    iscsiinterfaces.forEach(function(entry) {

        optionfound = 0;
        Array.from(document.querySelector("#iscsitargetinterfaces" + updaterow).options).forEach(function(option_element) {
            interfacecount++;

            if (option_element.value == 'ALL') {
                document.getElementById("iscsitargetinterfaces" + updaterow).remove(interfacecount - 1);
            } else if (option_element.value == iscsiinterfacelist[entry].interface.address) {
                optionfound = 1;
            }
        });

        if (optionfound == 0) {
            let newoption = document.createElement("option");
            newoption.value = iscsiinterfacelist[entry].interface.address;
            newoption.text = iscsiinterfacelist[entry].interface.address;
            newoption.setAttribute("bound", "0");
            newoption.addEventListener("mousedown",
                function(e) {
                    e.preventDefault();

                    if (this.selected == true) {
                        this.selected = false;
                    } else {
                        this.selected = true;
                    }
                    enableiscsibuttons('iscsitarget');
                    return false;
                }, false);

            document.getElementById("iscsitargetinterfaces" + updaterow).add(newoption);
        }
    });

    interfacecount = 0;
    var selectidx = 0;

    Array.from(document.querySelector("#iscsitargetinterfaces" + updaterow).options).forEach(function(option_element) {
        selectidx++;
        optionfound = 0;
        iscsiinterfaces.forEach(function(entry) {
            if (option_element.value == iscsiinterfacelist[entry].interface.address) {
                optionfound = 1;
                interfacecount++;
            }
        });

        if (optionfound == 0) {
            document.getElementById("iscsitargetinterfaces" + updaterow).remove(selectidx - 1);
        }
    });


    if (interfacecount == 0) {
        let newoption = document.createElement("option");
        newoption.value = "ALL";
        newoption.text = "ALL";
        newoption.selected = true;
        document.getElementById("iscsitargetinterfaces" + updaterow).add(newoption);
    }
}


function completeiscsigetrequest(iscsijson) {
    let activesection = document.getElementById('iscsidiv').getElementsByClassName('topmenutablinks active');

    if (activesection[0].name == 'itargets') {
        if (document.getElementById('iscsitargetsdiv').getAttribute('updating') == 'interfacelist') {
            updateiscsiinterfacelistselect(iscsijson);
            if (document.getElementById('iscsitargetsdiv').getAttribute('updatenext') == 'accountlist') {
                updateiscsiaccountlistselect(iscsijson);
            }
        } else if (document.getElementById('iscsitargetsdiv').getAttribute('updating') == 'accountlist') {
            updateiscsiaccountlistselect(iscsijson);
            if (document.getElementById('iscsitargetsdiv').getAttribute('updatenext') == 'interfacelist') {
                updateiscsiinterfacelistselect(iscsijson);
            }
        } else {
            updateiscsitargets(iscsijson);
        }
    } else if (activesection[0].name == 'iaccounts') {
        populateiscsiaccountdiv(iscsijson);
    } else {
        populateiscsiinterfacediv(iscsijson);
    }

    document.getElementById('iscsitargetsdiv').setAttribute('updatenext', '0');
    document.getElementById('iscsitargetsdiv').setAttribute('updating', 'all');
    document.getElementById('iscsitargetsdiv').setAttribute('updatingid', '0');

    if (activesection[0].id == 'itargetsbutton') {
        document.getElementById('iscsitargetsave').className = 'buttondisabled';
    } else if (activesection[0].id == 'iaccountsbutton') {
        document.getElementById('iscsiaccountsave').className = 'buttondisabled';
        document.getElementById('iscsiaccountrevert').className = 'buttondisabled';
    } else {
        document.getElementById('iscsiinterfacesave').className = 'buttondisabled';
        document.getElementById('iscsiinterfacerevert').className = 'buttondisabled';
    }

}

function completeiscsiputrequest() {
    document.getElementById('iscsitargetsdiv').setAttribute('updating', 'all');
    document.getElementById('iscsitargetsdiv').setAttribute('updatingid', '0');

    getconfig('GetISCSIConf');
}

function tokenRequestListener() {
    let tokenRequest = this;

    if (tokenRequest.readyState == tokenRequest.DONE) document.getElementById('loginprogress').style.visibility = 'hidden';

    if (tokenRequest.readyState == tokenRequest.DONE && tokenRequest.status != 200) {
        document.getElementById('loginfailedreason').innerHTML = tokenRequest.responseText;
        document.getElementById('loginfailed').style.visibility = 'visible';
        document.getElementById('showloginfailedreason').style.visibility = 'visible';
        document.getElementById('loginfailedreason').style.visibility = 'hidden';
    } else if (tokenRequest.readyState == tokenRequest.DONE && tokenRequest.status == 200) {
        document.getElementById('login').style.visibility = 'hidden';
        var responsedata = tokenRequest.responseXML;
        document.getElementById('ts').value = responsedata.getElementsByTagName("SessionToken")[0].childNodes[0].nodeValue;
        document.getElementById('ka').value = responsedata.getElementsByTagName("AccessKeyId")[0].childNodes[0].nodeValue;
        document.getElementById('ks').value = responsedata.getElementsByTagName("SecretAccessKey")[0].childNodes[0].nodeValue;
        if (LastHttpRequest.active == 1) {
            resendlastHttpRequest();
        }
        getsessionpermissions();
    }

}

function showloginfailedreason() {
    document.getElementById('loginfailedreason').style.visibility = 'visible';
}

function tokenRequestProgress() {
    document.getElementById('loginfailed').style.visibility = 'hidden';
    document.getElementById('showloginfailedreason').style.visibility = 'hidden';
    document.getElementById('loginfailedreason').style.visibility = 'hidden';
    document.getElementById('loginprogress').style.visibility = 'visible';
}


function encodejson(jsonstr) {
    return encodeURIComponent(jsonstr)
           .replace(/!/g, '%21')
           .replace(/'/g, '%27')
           .replace(/:::(/g, '%28')
           .replace(/:::)/g, '%29')
           .replace(/:::*/g, '%2A')
           .replace(/~/g, '%7E')
           .replace(/%20/g, '%20')  /* Space */
           .replace(/%2F/g, '%2F')  /* Slash (/) */
           .replace(/%3A/g, '%3A')  /* Colon (:) */
           .replace(/%3B/g, '%3B')  /* Semicolon (;) */
           .replace(/%40/g, '%40')  /* At sign (@) */
           .replace(/:::,/g, '%2C')  /* Comma (,) */
           .replace(/%24/g, '%24')  /* Dollar sign ($) */
           .replace(/%26/g, '%26')  /* Ampersand (&) */
           .replace(/%3D/g, '%3D'); /* Equal sign (=) */
}


function createrequesttoken(reqinfo) {
    const region = "nexfs";
    const service = "nexfsconsoleapi";
    const debug = 0;
    let login;
    let password;

    if (reqinfo.mgmttoken == 1) {
        login = document.getElementById('username').value;
        password = CryptoMD5.MD5(document.getElementById('password').value).toString(CryptoMD5.enc.Hex);
    } else {
        login = document.getElementById('ka').value;
        password = document.getElementById('ks').value;
    }

    if (login.length == 0 || password.length == 0)
        return (null);

    reqinfo.contentsha256 = new CryptoSHA256.SHA256("").toString(CryptoSHA256.enc.Hex);
    let signing_key = new getSignatureKey(password, reqinfo.datestamp, region, service);

    let signhost=window.location.hostname;

    if (location.port != "80" && location.port != 443 )
    {
      signhost+=":"+location.port;
    }

    let canonical_headers = 'host:' + signhost + '\\nx-amz-content-sha256:' + reqinfo.contentsha256 + '\\nx-amz-date:' + reqinfo.amzdate + '\\n';
    let signed_headers = 'host;x-amz-content-sha256;x-amz-date';

    /* let canonical_request = 'GET\\n/' + service + '\\n' + encodeURI(reqinfo.request_parameters) + '\\n' + canonical_headers + '\\n' + signed_headers + '\\n' + reqinfo.contentsha256; */
    let canonical_request = 'GET\\n/' + service + '\\n' + reqinfo.request_parameters + '\\n' + canonical_headers + '\\n' + signed_headers + '\\n' + reqinfo.contentsha256; 

    let canonicalrequestsignature = new CryptoSHA256.SHA256(canonical_request).toString(CryptoSHA256.enc.Hex);

    let credential_scope = reqinfo.datestamp + '/' + region + '/' + service + '/' + 'aws4_request';
    let string_to_sign = 'AWS4-HMAC-SHA256\\n' + reqinfo.amzdate + '\\n' + credential_scope + '\\n' + canonicalrequestsignature;

    let signature = new CryptoHmac.HmacSHA256(string_to_sign, signing_key);

    let authorization_header = 'AWS4-HMAC-SHA256 ' + 'Credential=' + login + '/' + credential_scope + ', ' + 'SignedHeaders=' + signed_headers + ', ' + 'Signature=' + signature;

    if (debug == 1) {
        console.log('Request Parameters: ' + reqinfo.request_parameters);
        console.log('Canonical Request: ' + canonical_request);
        console.log('Aws4 signing secret: ' + password);
        console.log('content sha256 hash: ' + reqinfo.contentsha256);
        console.log('String to sign: "' + string_to_sign + '"');
        console.log('kDate: "' + reqinfo.amzdate);
        console.log('kRegion: "' + region);
        console.log('kService: "' + service);
        console.log('kSigningKey: "' + signing_key);
        console.log('kSignature: "' + signature);
    }
    return authorization_header;
}

function resendlastHttpRequest() {
    const reqinfo = {};
    var ResendHttpRequest = new XMLHttpRequest();
    const d = new Date();
    reqinfo.datestamp = d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
    reqinfo.amzdate = reqinfo.datestamp + 'T' + ("0" + d.getHours()).slice(-2) + ("0" + d.getMinutes()).slice(-2) + ("0" + d.getSeconds()).slice(-2) + 'Z';
    reqinfo.mgmttoken = LastHttpRequest.mgmttoken; 
    reqinfo.action = LastHttpRequest.action;
    reqinfo.request_parameters = 'Action=' + reqinfo.action + encodeURI(LastHttpRequest.reqparms);
    reqinfo.url = window.location.href + 'api';
    reqinfo.authorization_header = createrequesttoken(reqinfo);

    if (reqinfo.authorization_header == null) return null;

    reqinfo.request_url = reqinfo.url + '?' + reqinfo.request_parameters;

    ResendHttpRequest.open("GET", reqinfo.request_url);
    ResendHttpRequest.setRequestHeader('x-amz-date', reqinfo.amzdate);
    ResendHttpRequest.setRequestHeader('x-amz-content-sha256', reqinfo.contentsha256);
    ResendHttpRequest.setRequestHeader('Authorization', reqinfo.authorization_header);
    ResendHttpRequest.setRequestHeader('content-type', 'application/x-www-form-urlencoded; charset=utf-8');
    ResendHttpRequest.onreadystatechange = RequestComplete;
    LastHttpRequest.active = 0;
    ResendHttpRequest.send();
}

function createHttpRequest(reqinfo, action, reqparms, mgmttoken, HttpRequest, nocreatelastrequest) {
    const d = new Date();
    reqinfo.datestamp = d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
    reqinfo.amzdate = reqinfo.datestamp + 'T' + ("0" + d.getHours()).slice(-2) + ("0" + d.getMinutes()).slice(-2) + ("0" + d.getSeconds()).slice(-2) + 'Z';
    reqinfo.mgmttoken = mgmttoken;
    reqinfo.action = action;
    reqinfo.request_parameters = 'Action=' + reqinfo.action + encodeURI(reqparms);
    reqinfo.url = window.location.href + 'api';
    reqinfo.authorization_header = createrequesttoken(reqinfo);

    if (reqinfo.authorization_header == null) return null;

    reqinfo.request_url = reqinfo.url + '?' + reqinfo.request_parameters;

    HttpRequest.open("GET", reqinfo.request_url);
    HttpRequest.setRequestHeader('x-amz-date', reqinfo.amzdate);
    HttpRequest.setRequestHeader('x-amz-content-sha256', reqinfo.contentsha256);
    HttpRequest.setRequestHeader('Authorization', reqinfo.authorization_header);
    HttpRequest.setRequestHeader('content-type', 'application/x-www-form-urlencoded; charset=utf-8');
    HttpRequest.onreadystatechange = RequestComplete;

    if (nocreatelastrequest == null) {
        LastHttpRequest.action = action;
        LastHttpRequest.reqparms = reqparms;
        LastHttpRequest.mgmttoken = mgmttoken;
        LastHttpRequest.active = 1;
    }

    return true;
}

function saveiscsitargets() {
    var targetcount = 0;

    if (document.getElementById('iscsitargetsave').className == 'buttondisabled') {
        return;
    }

    var iscsitargetsjson = '{ "itargets": [';
    var iscsibindingsjson = ' "bindings": [';

    var iscsitargets = document.getElementById('iscsitargetsdiv').getElementsByClassName("iscsitargetcontent");
    var targetcomma = '';
    var bindingcomma = '';

    for (let target = 0; target < iscsitargets.length; target++) {
        let thetarget = iscsitargets[target];
        let iscsitargetid = thetarget.getAttribute('iscsitargetid');
        let headerdigest = document.getElementById('iscsitargetheaderdigest' + iscsitargetid).checked;
        let datadigest = document.getElementById('iscsitargetdatadigest' + iscsitargetid).checked;
        targetcount++;

        iscsitargetsjson += targetcomma + '{  "itarget": { "tid": ' + iscsitargetid + ',';
        targetcomma = ',';

        iscsitargetsjson += '"headerdigest": ';
        if (headerdigest) {
            iscsitargetsjson += '"on",';
        } else {
            iscsitargetsjson += '"off",';
        }

        iscsitargetsjson += '"datadigest": ';
        if (datadigest) {
            iscsitargetsjson += '"on",';
        } else {
            iscsitargetsjson += '"off",';
        }

        iscsitargetsjson += '"luns": [';

        var iscsiluns = document.getElementsByClassName("iscsitarget" + iscsitargetid + "lun");
        var luncomma = '';

        for (let lun = 0; lun < iscsiluns.length; lun++) {
            let thelun = iscsiluns[lun];
            let iscsilunid = thelun.getAttribute('iscsilunid');

            iscsitargetsjson += luncomma + '{  "lun": ' + iscsilunid + ',';
            iscsitargetsjson += '   "path": "' + document.getElementById('iscsilunpathtarget' + iscsitargetid + 'lun' + iscsilunid).value + '",';
            iscsitargetsjson += '   "sn": "' + document.getElementById('iscsilunsntarget' + iscsitargetid + 'lun' + iscsilunid).value + '",';
            iscsitargetsjson += '   "mode": "' + document.getElementById('iscsilunmodetarget' + iscsitargetid + 'lun' + iscsilunid).value + '" }';
            luncomma = ',';
        }
        iscsitargetsjson += ']}}';
        iscsibindingsjson += bindingcomma + '{  "binding": { "tid": ' + iscsitargetid + ',  "bindto": [';
        bindingcomma = ',';
        var bindtocomma = '';

        let interfaceselect = document.getElementById('iscsitargetinterfaces' + iscsitargetid);

        for (let interface = 0; interface < interfaceselect.options.length; interface++) {
            if (interfaceselect.options[interface].selected) {
                if (interfaceselect.options[interface].getAttribute("bound") == "0") {
                    iscsibindingsjson += bindtocomma + '{ "address": "' + interfaceselect.options[interface].value + '", "mode": "add" }';
                    bindtocomma = ',';
                }
            } else if (interfaceselect.options[interface].getAttribute("bound") == "1") {
                iscsibindingsjson += bindtocomma + '{ "address": "' + interfaceselect.options[interface].value + '", "mode": "delete" }';
                bindtocomma = ',';
            }
        }

        iscsibindingsjson += ' ], "accounts": [';

        var accountcomma = '';

        let accounttargetselect = document.getElementById('iscsitargetaccounts' + iscsitargetid);
        let accountinboundselect = document.getElementById('iscsiinboundaccounts' + iscsitargetid);

        for (let account = 0; account < accounttargetselect.options.length; account++) {
            if (accounttargetselect.options[account].selected) {
                if (accounttargetselect.options[account].getAttribute("bound") == "0" && accounttargetselect.options[account].value != 'n0n3xfs0utb0undacc0unt') {
                    iscsibindingsjson += accountcomma + '{ "username": "' + accounttargetselect.options[account].value + '", "mode": "addtarget" }';
                    accountcomma = ',';
                }
            } else if (accounttargetselect.options[account].getAttribute("bound") == "1") {
                iscsibindingsjson += accountcomma + '{ "username": "' + accounttargetselect.options[account].value + '", "mode": "deletetarget" }';
                accountcomma = ',';
            }

            if (account > 0) {
                if (accountinboundselect.options[account - 1].selected) {
                    if (accountinboundselect.options[account - 1].getAttribute("bound") == "0") {
                        iscsibindingsjson += accountcomma + '{ "username": "' + accountinboundselect.options[account - 1].value + '", "mode": "add" }';
                        accountcomma = ',';
                    }
                } else if (accountinboundselect.options[account - 1].getAttribute("bound") == "1") {
                    iscsibindingsjson += accountcomma + '{ "username": "' + accountinboundselect.options[account - 1].value + '", "mode": "delete" }';
                    accountcomma = ',';
                }
            }
        }


        iscsibindingsjson += ']}} ';
    }

    iscsitargetsjson += ']';
    iscsibindingsjson += ']';

    const iscsijson = iscsitargetsjson + ',' + iscsibindingsjson + '}';

    if (targetcount > 0) {
        SendJSONrequest(iscsijson, 'PutISCSIConf');
    }
}

function saveiscsiaccounts() {
    var accountcount = 0;

    if (document.getElementById('iscsiaccountsave').className == 'buttondisabled') {
        return;
    }

    var iscsiaccountjson = '{ "accounts": [';

    var iscsiaccounts = document.getElementById('iscsiaccountsdiv').getElementsByClassName("iscsiaccountcontent");
    let comma = '';

    for (let i = 0; i < iscsiaccounts.length; i++) {
        let therow = iscsiaccounts[i].getAttribute('iscsiaccountid');

        if (document.getElementById('iscsiaccountdelete' + therow).checked && document.getElementById('iscsiaccountusername' + therow).value.length == 0) {
            continue;
        }

        if ((!document.getElementById('iscsiaccountdelete' + therow).checked) && document.getElementById('iscsiaccountloadedpassword' + therow).value.length > 0 && document.getElementById('iscsiaccountloadedpassword' + therow).value == document.getElementById('iscsiaccountpassword' + therow).value) {
            continue;
        }

        iscsiaccountjson += comma + '{ "account":    { "username":    "' + document.getElementById('iscsiaccountusername' + therow).value + '",';

        if (document.getElementById('iscsiaccountdelete' + therow).checked) {
            iscsiaccountjson += '"mode":    "delete"';
        } else {
            iscsiaccountjson += '  "password":    "' + document.getElementById('iscsiaccountpassword' + therow).value + '",';
            iscsiaccountjson += '"mode":    "';

            if (document.getElementById('iscsiaccountloadedpassword' + therow).value.length > 0) {
                iscsiaccountjson += 'update"';
            } else {
                iscsiaccountjson += 'add"';
            }
        }

        iscsiaccountjson += '}}';
        comma = ',';
        accountcount++;
    }

    iscsiaccountjson += ']}';

    if (accountcount > 0) {
        SendJSONrequest(iscsiaccountjson, 'PutISCSIConf');
    }
}

function saveiscsiinterfaces() {
    var interfacecount = 0;

    if (document.getElementById('iscsiinterfacesave').className == 'buttondisabled') {
        return;
    }

    var iscsiinterfacejson = '{ "interfaces": [';

    var iscsiinterfaces = document.getElementById('iscsiinterfacesdiv').getElementsByClassName("iscsiinterfacecontent");
    let comma = '';

    for (let i = 0; i < iscsiinterfaces.length; i++) {
        let therow = iscsiinterfaces[i].getAttribute('iscsiinterfaceid');

        if (document.getElementById('iscsiinterfacedelete' + therow).checked && document.getElementById('iscsiinterfaceaddress' + therow).value.length == 0) {
            continue;
        }

        iscsiinterfacejson += comma + '{ "interface":    { "address":    "' +
            document.getElementById('iscsiinterfaceaddress' + therow).value + ':' +
            document.getElementById('iscsiinterfaceport' + therow).value + '",' +
            '"mode":    "';

        if (document.getElementById('iscsiinterfacedelete' + therow).checked) {
            iscsiinterfacejson += 'delete"';
        } else {
            iscsiinterfacejson += 'add"';
        }
        iscsiinterfacejson += '}}';
        comma = ',';
        interfacecount++;
    }

    iscsiinterfacejson += ']}';

    if (interfacecount > 0) {
        SendJSONrequest(iscsiinterfacejson, 'PutISCSIConf');
    }
}

function savenfsexports() {
    if (document.getElementById('nfsexportsave').className == 'buttondisabled') {
        return;
    }

    var nfsexportsjson = '{ "nfsexports": [';

    var nfsexports = document.getElementById('nfsexportsdiv').getElementsByClassName("nfsexportcontent");
    let comma = '';

    for (let i = 0; i < nfsexports.length; i++) {
        let nfsexportid = nfsexports[i].getAttribute('exportid');
        nfsexportsjson += comma + '{ "exportdir": "' + document.getElementById('nfsexportfolder' + nfsexportid).value + '",';

        nfsexportsjson += ' "enabled": ';
        if (document.getElementById('nfsexportadvancedenabled' + nfsexportid).checked) {
            nfsexportsjson += '1,';
        } else {
            nfsexportsjson += '0,';
        }

        nfsexportsjson += ' "rootexport": ';
        if (document.getElementById('nfsexportadvancedrootexport' + nfsexportid).checked) {
            nfsexportsjson += '1,';
        } else {
            nfsexportsjson += '0,';
        }

        nfsexportsjson += ' "auth": "' + document.getElementById('nfsexportclients' + nfsexportid).value + '",';

        nfsexportsjson += ' "secsys": ';
        if (document.getElementById('nfsexportsecuritysys' + nfsexportid).checked) {
            nfsexportsjson += '1,';
        } else {
            nfsexportsjson += '0,';
        }

        nfsexportsjson += ' "seckrb5": ';
        if (document.getElementById('nfsexportsecuritykrb5' + nfsexportid).checked) {
            nfsexportsjson += '1,';
        } else {
            nfsexportsjson += '0,';
        }

        nfsexportsjson += ' "seckrb5i": ';
        if (document.getElementById('nfsexportsecuritykrb5i' + nfsexportid).checked) {
            nfsexportsjson += '1,';
        } else {
            nfsexportsjson += '0,';
        }

        nfsexportsjson += ' "seckrb5p": ';
        if (document.getElementById('nfsexportsecuritykrb5p' + nfsexportid).checked) {
            nfsexportsjson += '1,';
        } else {
            nfsexportsjson += '0,';
        }

        nfsexportsjson += ' "rw": ';
        if (document.getElementById('exportreadwrite' + nfsexportid).checked) {
            nfsexportsjson += '1,';
        } else {
            nfsexportsjson += '0,';
        }

        nfsexportsjson += ' "async": ';
        if (document.getElementById('nfsexportadvancedasync' + nfsexportid).checked) {
            nfsexportsjson += '1,';
        } else {
            nfsexportsjson += '0,';
        }

        nfsexportsjson += ' "nowdelay": ';
        if (document.getElementById('nfsexportadvancednowdelay' + nfsexportid).checked) {
            nfsexportsjson += '1,';
        } else {
            nfsexportsjson += '0,';
        }

        nfsexportsjson += ' "squash": ' + document.getElementById('nfsexportsquashmode' + nfsexportid).value + ',';

        nfsexportsjson += ' "anonuid": ' + document.getElementById('nfsexportanonuid' + nfsexportid).value + ',';
        nfsexportsjson += ' "anongid": ' + document.getElementById('nfsexportanongid' + nfsexportid).value + ',';

        nfsexportsjson += ' "securelocks": ';
        if (document.getElementById('nfsexportadvancedsecurelocks' + nfsexportid).checked) {
            nfsexportsjson += '1,';
        } else {
            nfsexportsjson += '0,';
        }

        nfsexportsjson += ' "subtree_check": ';
        if (document.getElementById('nfsexportadvancedsubtreecheck' + nfsexportid).checked) {
            nfsexportsjson += '1';
        } else {
            nfsexportsjson += '0';
        }

        nfsexportsjson += '}';
        comma = ',';
    }

    nfsexportsjson += '  ]  }';

    SendJSONrequest(nfsexportsjson, 'PutNFSExports');
}

function selectfile(theinput) {
    if (document.getElementById('filepermissions').getAttribute('ListFiles') == '0' ||
        document.getElementById('filepermissions').getAttribute('ListDirectories') == '0') {
        return;
    }

    document.getElementById('fileselectdiv').classList.remove("hidden");
    document.getElementById('fileselecttargetid').value = theinput;
    document.getElementById('fileselectdepth').value = "0";
    document.getElementById('fileselectedentry').value = "";
    document.getElementById('fileselectmode').value = "1";


    if (document.getElementById('filepermissions').getAttribute('CreateFiles') == '0') {
        document.getElementById('createfileselect').className = 'hidden';
    } else {
        document.getElementById('createfileselect').className = 'button';
    }

    if (document.getElementById('filepermissions').getAttribute('createdirectories') == '0') {
        document.getElementById('createdirectoryselect').className = 'hidden';
    } else {
        document.getElementById('createdirectoryselect').className = 'button';
    }

    var basedir = document.getElementById(theinput).value;

    if (basedir.length == 0 || basedir == '/') {
        document.getElementById('fileselectedentry').value = '';
    } else {
        const pathArray = basedir.split("/");

        if (pathArray.length == 1) {
            document.getElementById('fileselectedentry').value = basedir;
        } else {
            document.getElementById('fileselectedentry').value = pathArray[pathArray.length - 1];
            basedir = '';
            for (var loop = 0; loop < pathArray.length - 2; loop++) {
                basedir += pathArray[loop] + '/';
            }
            basedir[basedir.length - 1] = '';
        }
    }

    dirlisting(basedir);
}

function selectfolder(theinput) {
    if (document.getElementById('filepermissions').getAttribute('ListDirectories') == '0') {
        return;
    }

    document.getElementById('fileselectdiv').classList.remove("hidden");
    document.getElementById('fileselecttargetid').value = theinput;
    document.getElementById('fileselectdepth').value = "0";
    document.getElementById('fileselectedentry').value = "";
    document.getElementById('fileselectmode').value = "0";
    document.getElementById('createfileselect').className = 'hidden';

    if (document.getElementById('filepermissions').getAttribute('CreateDirectories') == '0') {
        document.getElementById('createdirectoryselect').className = 'hidden';
    } else {
        document.getElementById('createdirectoryselect').className = 'button';
    }

    var basedir = document.getElementById(theinput).value;

    if (basedir.length == 0 || basedir == '/') {
        document.getElementById('fileselectedentry').value = '/';
    } else {
        const pathArray = basedir.split("/");

        if (pathArray.length == 1) {
            document.getElementById('fileselectedentry').value = basedir;
        } else {
            document.getElementById('fileselectedentry').value = pathArray[pathArray.length - 1];
        }
    }

    dirlisting(basedir);
}

function downdirlisting(basedir) {
    let depth = parseInt(document.getElementById('fileselectdepth').value);
    depth--;
    document.getElementById('fileselectdepth').value = depth;

    if (basedir.length > 0) {
        const pathArray = basedir.split("/");

        if (pathArray.length > 1) {
            basedir = '';
            for (var loop = 0; loop < pathArray.length - 2; loop++) {
                basedir += pathArray[loop] + '/';
            }
            basedir[basedir.length - 1] = '';
        }
    }
    dirlisting(basedir);
}

function updirlisting(basedir) {
    let depth = parseInt(document.getElementById('fileselectdepth').value);
    depth++;
    document.getElementById('fileselectdepth').value = depth;
    dirlisting(basedir);
}

function dirlisting(basedir) {

    if (basedir.length == 0) {
        basedir = "/";
    } else if (basedir !== "/") {
        if (basedir[basedir.length - 1] !== '/') {
            const pathArray = basedir.split("/");

            if (pathArray.length > 1) {
                basedir = '';
                for (var loop = 0; loop < pathArray.length - 1; loop++) {
                    basedir += pathArray[loop] + '/';
                }
                basedir[basedir.length - 1] = '';
            } else {
                basedir = "/";
            }
        }
    }

    document.getElementById('fileselectnextpath').value = basedir;

    getdirectorylisting(basedir, document.getElementById('fileselectmode').value);
}



function getdirectorylisting(basedir, mode) {
    const reqinfo = {};
    var HttpRequest = new XMLHttpRequest();
    var reqparms = '&ListDir=' + encodejson(basedir) + '&Mode=' + mode;
    if (createHttpRequest(reqinfo, 'GetDirectoryListing', reqparms, 0, HttpRequest) == null) return;
    HttpRequest.send();
}

function getsystemstatus() {
    const reqinfo = {};
    var HttpRequest = new XMLHttpRequest();
    if (createHttpRequest(reqinfo, 'GetSystemStatus', '', 0, HttpRequest) == null) return;
    HttpRequest.send();
}

function geterrorlogs() {
    const reqinfo = {};
    var HttpRequest = new XMLHttpRequest();
    if (createHttpRequest(reqinfo, 'GetErrorLog', '', 0, HttpRequest) == null) return;
    HttpRequest.send();
}

function getconfig(whichconfig) {
    const reqinfo = {};
    var HttpRequest = new XMLHttpRequest();
    if (createHttpRequest(reqinfo, whichconfig, '', 0, HttpRequest) == null) return;
    HttpRequest.send();
}

function getlicensedetails() {
    const reqinfo = {};
    var HttpRequest = new XMLHttpRequest();
    if (createHttpRequest(reqinfo, 'GetLicenseDetails', '', 0, HttpRequest) == null) return;
    HttpRequest.send();
}

function sendattachuserrole(UserId, role, roletype) {
    const reqinfo = {};
    var HttpRequest = new XMLHttpRequest();
    var reqparms = '&RoleName=' + role + '&RoleType=' + roletype + '&UserId=' + UserId;
    if (createHttpRequest(reqinfo, 'AttachUserRole', reqparms, 0, HttpRequest) == null) return;
    HttpRequest.send();
}

function senddetachuserrole(UserId, role, roletype) {
    const reqinfo = {};
    var HttpRequest = new XMLHttpRequest();
    var reqparms = '&RoleName=' + role + '&RoleType=' + roletype + '&UserId=' + UserId;
    if (createHttpRequest(reqinfo, 'DetachUserRole', reqparms, 0, HttpRequest) == null) return;
    HttpRequest.send();
}

function senddeleteuserrequest(UserId) {
    const reqinfo = {}; 
    var HttpRequest = new XMLHttpRequest();
    var reqparms = '&UserId=' + UserId;
    if (createHttpRequest(reqinfo, 'DeleteUser', reqparms, 0, HttpRequest) == null) return;
    HttpRequest.send();
}

function sendsaveuserrequest(OrgUserId, UserId, UserName, UserSecretHash, UserContentSecret, UserEmail, UserDescription1, UserDescription2, UserAuthMethod, UID, GID) {
    const reqinfo = {};
    let action = 'UpdateUser';

    var HttpRequest = new XMLHttpRequest();
    var reqparms = "";

    if (UserAuthMethod != null) {
        reqparms += '&AuthMethod=' + UserAuthMethod;
    }

    if (UserDescription1 != null || UserDescription2 != null) {
        reqparms += '&Description={ ';
        if (UserDescription1 != null) {
            reqparms += '"UserDescription1": "' + UserDescription1 + '"';
        }

        if (UserDescription1 != null && UserDescription2 != null) {
            reqparms += ',';
        }

        if (UserDescription2 != null) {
            reqparms += '"UserDescription2": "' + UserDescription2 + '"';
        }

        reqparms += '}';
    }

    if (UserEmail != null) {
        reqparms += '&Email=' + UserEmail;
    }

    if (UserContentSecret != null) {
        reqparms += '&NewContentSecret=' + UserContentSecret;
    }

    if (UserSecretHash != null) {
        reqparms += '&NewSecretHash=' + UserSecretHash;
    }

    if (UserId != null) {
        reqparms += '&NewUserId=' + UserId;
    }

    if (GID != null) {
        reqparms += '&POSIXGID=' + GID;
    }

    if (UID != null) {
        reqparms += '&POSIXUID=' + UID;
    }

    reqparms += '&UserId=' + OrgUserId;

    if (UserName != null) {
        reqparms += '&UserName=' + UserName;
    }

    if (createHttpRequest(reqinfo, action, reqparms, 0, HttpRequest) == null) return;
    HttpRequest.send();
}


function sendcreateuserrequest(UserId, UserName, UserSecretHash, UserContentSecret, UserEmail, UserDescription1, UserDescription2, UserAuthMethod, Roles, UID, GID) {
    const reqinfo = {};
    let action = 'CreateUser';

    var HttpRequest = new XMLHttpRequest();
    var reqparms = "";

    if (Roles != null) {
        reqparms += '&AssumeRolePolicyDocument=' + Roles;
    }

    if (UserAuthMethod != null) {
        reqparms += '&AuthMethod=' + UserAuthMethod;
    }

    if (UserDescription1 != null || UserDescription2 != null) {
        reqparms += '&Description={ "UserDescription1": "' + UserDescription1 + '","UserDescription2": "' + UserDescription2 + '" }';
    }

    if (UserEmail != null) {
        reqparms += '&Email=' + UserEmail;
    }

    if (UserContentSecret != null) {
        reqparms += '&NewContentSecret=' + UserContentSecret;
    }

    if (UserSecretHash != null) {
        reqparms += '&NewSecretHash=' + UserSecretHash;
    }

    if (GID != null) {
        reqparms += '&POSIXGID=' + GID;
    }


    if (UID != null) {
        reqparms += '&POSIXUID=' + UID;
    }

    reqparms += '&UserId=' + UserId + '&UserName=' + UserName;

    if (createHttpRequest(reqinfo, action, reqparms, 0, HttpRequest) == null) return;
    HttpRequest.send();
}

function sendsaverolerequest(RoleName, Statement, Version, Create, RoleId, Enabled, roletype) {
    const reqinfo = {};
    let action = 'SaveRole';

    if (Create) {
        action = 'CreateRole';
    }
    var HttpRequest = new XMLHttpRequest();
    var reqparms = '&AssumeRolePolicyDocument=' + encodejson(Statement) + '&Enabled=' + Enabled;

    if (RoleId != null) {
        reqparms += '&RoleId=' + RoleId;
    }
    reqparms += '&RoleName=' + RoleName + '&RoleType=';

    if ( roletype == 'iammgmt' ) {
        reqparms+='iam';
    }
    else { 
        reqparms+='user';
    }

    reqparms +='&Version=' + encodejson(Version);


    if (createHttpRequest(reqinfo, action, reqparms, 0, HttpRequest) == null) return;
    HttpRequest.send();
}

function getuser(userid) {
    const reqinfo = {};
    var HttpRequest = new XMLHttpRequest();
    var reqparms = '&UserId=' + userid;
    if (createHttpRequest(reqinfo, 'GetUser', reqparms, 0, HttpRequest) == null) return;
    HttpRequest.send();
}

function sendgetconfsreq(reqjson, mode) {
    const reqinfo = {};
    var HttpRequest = new XMLHttpRequest();
    var reqparms = '&Mode=' + mode + '&RequestJSON=' +  encodejson(reqjson);
    if (createHttpRequest(reqinfo, 'GetConfigs', reqparms, 0, HttpRequest) == null) return;
    HttpRequest.send();
}

function completeputcertificate() {
    document.getElementById('rawpem').value='';
    document.getElementById( 'addcertdiv').className='hidden'; 
    getconfig('ListCertificates');
}

function completedeletecertificate() {
    document.getElementById('certificatedetailsdiv').className='hidden'; 
    getconfig('ListCertificates');
}

function completelistcertificates(response) {
    let certtable = document.getElementById("certtable");

    while (certtable.rows.length > 1) {
        certtable.deleteRow(1);
    }

    let RequestCompleted = response.getElementsByTagName("RequestCompleted")[0];
    let GetCertificatesResponse = RequestCompleted.getElementsByTagName("GetCertificatesResponse")[0];
    let Certificates = GetCertificatesResponse.getElementsByTagName("Certificates")[0];
    let CertificateList = Certificates.getElementsByTagName("Certificate");
    let cnRegex = /CN=([^/]+)/;

    for (let Certificate = 0; Certificate < CertificateList.length; Certificate++) {
        let Index = CertificateList[Certificate].getElementsByTagName('Index')[0].childNodes[0].nodeValue;
        let Subject = CertificateList[Certificate].getElementsByTagName('Subject')[0].childNodes[0].nodeValue;
        let ValidFrom =  CertificateList[Certificate].getElementsByTagName('ValidFrom')[0].childNodes[0].nodeValue;
        let ValidUntil =  CertificateList[Certificate].getElementsByTagName('ValidUntil')[0].childNodes[0].nodeValue;
        let ContextServer =  CertificateList[Certificate].getElementsByTagName('ContextServer')[0].childNodes[0].nodeValue;
        let ManagementServer =  CertificateList[Certificate].getElementsByTagName('ManagementServer')[0].childNodes[0].nodeValue;

        let newrow = certtable.insertRow(-1);
        let indexcell = newrow.insertCell(0);
        let issuercell = newrow.insertCell(1);
        let validfromcell = newrow.insertCell(2);
        let validtocell = newrow.insertCell(3);

        let cnMatch = Subject.match(cnRegex);

        indexcell.innerHTML=Index;
        issuercell.innerHTML=cnMatch[1];
        validfromcell.innerHTML=ValidFrom;
        validtocell.innerHTML=ValidUntil;

    
        let contextcertcell = newrow.insertCell(4);
        if ( ContextServer == "True" )
        {
          contextcertcell.innerHTML = '<center><input type="checkbox" checked </center>';    
        }

        let mgmtcertcell = newrow.insertCell(5);
        if ( ManagementServer == "True" )
        {
          mgmtcertcell.innerHTML = '<center><input type="checkbox" checked </center>';    
        }

        newrow.addEventListener("click",  function() { loadcertificate(Index) } );
    }
}

function loadcertificate(Index)
{
  var HttpRequest = new XMLHttpRequest();
  
  const reqinfo = {};
  var reqparms = '&CerfificateIDX=' + Index; 
  if (createHttpRequest(reqinfo, 'GetCertificate', reqparms, 0, HttpRequest) == null) return;
  HttpRequest.send();
}

function completeloadcertificate(response)
{
  let RequestCompleted = response.getElementsByTagName("RequestCompleted")[0];
  let GetCertificatesResponse = RequestCompleted.getElementsByTagName("GetCertificatesResponse")[0];
  let Certificate = GetCertificatesResponse.getElementsByTagName("Certificate")[0];
  let cnRegex = /CN=([^/]+)/;
  let cnMatch =  Certificate.getElementsByTagName('Subject')[0].childNodes[0].nodeValue.match(cnRegex);

  document.getElementById('certificateIndex').innerHTML = Certificate.getElementsByTagName('Index')[0].childNodes[0].nodeValue;
  document.getElementById('certificateCN').innerHTML = cnMatch[1]; 
  document.getElementById('certificateSubject').innerHTML = Certificate.getElementsByTagName('Subject')[0].childNodes[0].nodeValue;
  document.getElementById('certificateIssuer').innerHTML = Certificate.getElementsByTagName('Issuer')[0].childNodes[0].nodeValue;
  document.getElementById('certificateVersion').innerHTML = Certificate.getElementsByTagName('Version')[0].childNodes[0].nodeValue;
  document.getElementById('certificateStart').innerHTML =  Certificate.getElementsByTagName('ValidFrom')[0].childNodes[0].nodeValue;
  document.getElementById('certificateEnd').innerHTML =  Certificate.getElementsByTagName('ValidUntil')[0].childNodes[0].nodeValue;
  document.getElementById('certificateCA').innerHTML =  Certificate.getElementsByTagName('ca')[0].childNodes[0].nodeValue;
  document.getElementById('certificateSelfSigned').innerHTML =  Certificate.getElementsByTagName('SelfSigned')[0].childNodes[0].nodeValue;
  
  if ( Certificate.getElementsByTagName('ContextServer')[0].childNodes[0].nodeValue == "True" ) {
    document.getElementById('certificateContextServer').checked = true;
    document.getElementById('certificateContextServer').setAttribute("loadedvalue","1");
  }
  else
  {
    document.getElementById('certificateContextServer').checked = false;
    document.getElementById('certificateContextServer').setAttribute("loadedvalue","0");
  }

  if ( Certificate.getElementsByTagName('ManagementServer')[0].childNodes[0].nodeValue == "True" ) {
    document.getElementById('certificateManagmentServer').checked = true; 
    document.getElementById('certificateManagmentServer').setAttribute("loadedvalue","1");
  }
  else
  {
    document.getElementById('certificateManagmentServer').checked = false; 
    document.getElementById('certificateManagmentServer').setAttribute("loadedvalue","0");
  }

  document.getElementById('certificatedetailsdiv').className = 'certificatedetailsdiv';
}

function deletecertificate()
{
   if (confirm("Are you sure you want to delete certificate at index  " + document.getElementById('certificateIndex').innerHTML + "?") == true) {
     const reqinfo = {};
     var HttpRequest = new XMLHttpRequest();
     var reqparms = '&CerfificateIDX=' + document.getElementById('certificateIndex').innerHTML; 
     if (createHttpRequest(reqinfo, 'DeleteCertificate', reqparms, 0, HttpRequest) == null) return;
     HttpRequest.send();
   }
}

function updatecertificate()
{
  let addcomma=0;
  let json = '{ "Configs": [ ';

  if ( document.getElementById('certificateManagmentServer').checked && document.getElementById('certificateManagmentServer').getAttribute('loadedvalue') == "0" ) 
  {
    json+= '{ "VarName": "MGMTWEBSERVERCERTIFICATEIDX","NewValue": "' + document.getElementById('certificateIndex').innerHTML + '","UpdateMode": "3"}';
    addcomma=1;
  }
  else if ( ! document.getElementById('certificateManagmentServer').checked  && document.getElementById('certificateManagmentServer').getAttribute('loadedvalue') == "1" ) 
  {
    json+= '{ "VarName": "MGMTWEBSERVERCERTIFICATEIDX","NewValue": "0","UpdateMode": "3"}';
    addcomma=1;
  }
  
  if ( document.getElementById('certificateContextServer').checked  && document.getElementById('certificateContextServer').getAttribute('loadedvalue') == "0" )
  {
    if ( addcomma == 1 ) {
        json+=',';
    }
    json+= '{ "VarName": "CONTENTWEBSERVERCERTIFICATEIDX","NewValue": "' + document.getElementById('certificateIndex').innerHTML + '","UpdateMode": "3"}';
  }
  else if ( ! document.getElementById('certificateContextServer').checked  && document.getElementById('certificateContextServer').getAttribute('loadedvalue') == "1" )
  {
    if ( addcomma == 1 ) {
        json+=',';
    }
    json+= '{ "VarName": "CONTENTWEBSERVERCERTIFICATEIDX","NewValue": "0","UpdateMode": "3"}';
  }

  json+='] }';

  UpdateConfigs(json, 'certificatedetails');
}

function uploadcertpem()
{
  if ( document.getElementById("docertadd").className == 'buttondisabled' ) return;

  var HttpRequest = new XMLHttpRequest();

  const reqinfo = {};
  var reqparms = '&Cerfificate=' + encodejson(document.getElementById('rawpem').value);
  if (createHttpRequest(reqinfo, 'PutCertificate', reqparms, 0, HttpRequest) == null) return;
  HttpRequest.send();
}

function senddeleterole(roletype, rolename, version) {
    const reqinfo = {};
    var HttpRequest = new XMLHttpRequest();
    var reqparms = '&RoleName=' + encodejson(rolename); 

    if ( roletype == 'iammgmt' ) {
      reqparms+= '&RoleType=iam';
    }
    else { 
        reqparms+='&RoleType=user';
    }

    reqparms+= '&Version=' + encodejson(version);
    if (createHttpRequest(reqinfo, 'DeleteRole', reqparms, 0, HttpRequest) == null) return;
    HttpRequest.send();
}

function sendupdatesecretrequest(oldhash, newhash) {
    const reqinfo = {};
    var HttpRequest = new XMLHttpRequest();
    var reqparms = '&NewSecretHash=' + newhash + '&OldSecretHash=' + oldhash;
    if (createHttpRequest(reqinfo, 'ChangePassword', reqparms, 0, HttpRequest, true) == null) return;
    HttpRequest.send();
}

function getsessionpermissions() {
    const reqinfo = {};
    var HttpRequest = new XMLHttpRequest();
    var reqjson = '{"Permissions": [ "nexfs:PauseServer", "nexfs:GetSystemStatus", "nexfs:GetConfiguration","nexfs:UpdateConfiguration","nfs:GetSubSystem","nfs:GetConfiguration", "nfs:ManageSubSystem","nfs:GetConfiguration","iscsi:GetSubSystem","iscsi:ManageSubSystem","iscsi:GetConfiguration","iscsi:UpdateConfiguration","nexfs:GetLicenseDetails","nexfs:UpdateLicense","nexfs:CreateFiles","nexfs:CreateDirectories","nexfs:ListFiles","nexfs:ListDirectories","iam:GetManagementRoles","iam:UpdateManagementRoles", "iam:ListManagementRoles", "iam:DeleteManagementRoles", "nexfs:GetContentRoles","nexfs:ListContentRoles", "nexfs:UpdateContentRoles", "nexfs:DeleteManagementRoles", "iam:ListUsers", "iam:GetUser", "iam:UpdateOtherUserSecret","iam:UpdateOtherUserContentSecret","iam:UpdateUsers", "iam:UpdateOwnSecret", "nexfs:ManageCertificate" ]}';
    var reqparms = '&RequestJSON=' + encodejson(reqjson);
    if (createHttpRequest(reqinfo, 'GetSessionPermissions', reqparms, 0, HttpRequest, true) == null) return;
    HttpRequest.send();
}

function getsessiontoken() {
    const reqinfo = {};
    var tokenRequest = new XMLHttpRequest();
    if (createHttpRequest(reqinfo, 'GetSessionToken', '', 1, tokenRequest, true) == null) return;
    tokenRequest.onreadystatechange = tokenRequestListener;
    tokenRequestProgress();
    tokenRequest.send();
    document.getElementById('password').value = "";
}

function dologout() {
    const reqinfo = {};
    var HttpRequest = new XMLHttpRequest();
    var reqparms = '&SessionToken=' + document.getElementById('ts').value;
    if (createHttpRequest(reqinfo, 'RevokeSessionToken', reqparms, 0, HttpRequest) == null) return;
    document.getElementById('ReloadonError').innerHTML = "reload";
    HttpRequest.send();
}

function uploadlicensekey() {
    UpdateConfig('NEXFSLICENSEKEY', document.getElementById('newlicensekey').value, 3, 'updatelicensediv');
}

function SendJSONrequest(json, requestaction) {
    const reqinfo = {};
    var HttpRequest = new XMLHttpRequest();
    var reqparms = '&RequestJSON=' + encodejson(json);
    if (createHttpRequest(reqinfo, requestaction, reqparms, 0, HttpRequest) == null) return;
    HttpRequest.send();
}

function UpdateConfigs(json, confformtoreload) {
    const reqinfo = {};
    var HttpRequest = new XMLHttpRequest();
    var reqparms = '&RequestJSON=' + encodejson(json);
    if (createHttpRequest(reqinfo, 'UpdateConfigs', reqparms, 0, HttpRequest) == null) return;
    document.getElementById('reloadconfdiv').innerHTML = confformtoreload;
    HttpRequest.send();
}

function UpdateConfig(varname, newvalue, mode, hidediv) {
    const reqinfo = {};
    var HttpRequest = new XMLHttpRequest();
    var reqparms = '&ConfigurationNewValue=' + encodejson(newvalue) + '&ConfigurationVarName=' + varname + '&UpdateMode=' + mode;
    if (createHttpRequest(reqinfo, 'UpdateConfig', reqparms, 0, HttpRequest) == null) return;

    if (hidediv == null)
        document.getElementById('inprogresshidediv').innerHTML = '';
    else
        document.getElementById('inprogresshidediv').innerHTML = hidediv;

    HttpRequest.send();
}

function showupdatelicensediv() {
    const reqinfo = {};
    var HttpRequest = new XMLHttpRequest();
    var reqparms = '&ConfigurationVarName=NEXFSLICENSEKEY&Mode=1';
    if (createHttpRequest(reqinfo, 'GetConfig', reqparms, 0, HttpRequest) == null) return;
    HttpRequest.onreadystatechange = UpdateCurrentLicenseDetails;
    HttpRequest.send();
    document.getElementById('updatelicensediv').className = 'paneldiv';
}

function showcertadddiv() {
    const reqinfo = {};
    document.getElementById('addcertdiv').className = 'paneldiv';
}