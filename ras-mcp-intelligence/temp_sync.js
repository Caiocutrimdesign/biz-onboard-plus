import axios from 'axios';

async function syncCaio() {
  const mirrorPayload = new URLSearchParams();
  const FIXED_TOKEN = "8UefPinuAXg6QJgUygn4gUN618ULTBDBnrdBAR9b";
  
  mirrorPayload.append('_token', FIXED_TOKEN);
  mirrorPayload.append('fakeusernameremembered', '');
  mirrorPayload.append('fakepasswordremembered', '');
  mirrorPayload.append('sync_button_status', '0');
  mirrorPayload.append('data_cpf_cnpj', '');
  mirrorPayload.append('id', '');
  mirrorPayload.append('active', '1');
  mirrorPayload.append('group_id', '2');
  mirrorPayload.append('manager_id', '96833');
  mirrorPayload.append('bin_admin_flags', '0');
  mirrorPayload.append('bin_admin_flags', '1');
  mirrorPayload.append('bin_permissions', '-1');
  mirrorPayload.append('template_bin_permissions', '-1');

  mirrorPayload.append('name', '');
  mirrorPayload.append('client_name', 'Caio Cutrim');
  mirrorPayload.append('email', 'test-caio-100@caiocutrimdesigner.com.br');
  mirrorPayload.append('client_login', 'test-caio-100@caiocutrimdesigner.com.br');
  mirrorPayload.append('client_tab_client_email', 'test-caio-100@caiocutrimdesigner.com.br');
  mirrorPayload.append('client_tab_client_cpf', '60461831384'); 
  mirrorPayload.append('password', 'Caio018@');
  mirrorPayload.append('password_confirmation', 'Caio018@');
  mirrorPayload.append('client_pass', 'Caio018@');
  mirrorPayload.append('data_de_vencimento', '14');
  mirrorPayload.append('client_tab_client_fone', '61999999999');
  mirrorPayload.append('client_tab_client_postal_code', '');
  mirrorPayload.append('client_tab_client_address', '');
  mirrorPayload.append('client_tab_client_address_number', '');
  mirrorPayload.append('client_tab_complemento', '');
  mirrorPayload.append('client_tab_client_address_bairro', '');
  mirrorPayload.append('client_tab_client_address_city', '');
  mirrorPayload.append('client_tab_client_address_state', '');
  mirrorPayload.append('tel_cel', '');
  mirrorPayload.append('taxa_mensal', '');
  mirrorPayload.append('available_maps[]', '1');
  mirrorPayload.append('available_maps[]', '2');
  mirrorPayload.append('available_maps[]', '3');
  
  const permsMap = {
    'devices': ['view', 'edit'],
    'alerts': ['view', 'edit', 'remove'],
    'geofences': ['view', 'edit', 'remove'],
    'reports': ['view', 'edit', 'remove'],
    'send_command': ['view'],
    'history': ['view', 'remove'],
    'sharing': ['view', 'edit', 'remove']
  };

  Object.entries(permsMap).forEach(([mod, actions]) => {
    actions.forEach(act => {
      mirrorPayload.append(`perms[${mod}][${act}]`, '1');
    });
  });

  const headers = {
    "accept": "application/json, text/javascript, */*; q=0.01",
    "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "origin": "https://aplicativo.rastremix.com.br",
    "referer": "https://aplicativo.rastremix.com.br/admin/users/clients",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
    "x-requested-with": "XMLHttpRequest",
    "Cookie": "_ga=GA1.1.750912743.1775263527; remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d=eyJpdiI6IjREdnZrMFRDRGhGWE1zR0xkNkRKeUE9PSIsInZhbHVlIjoiUzRMNTBOREZCZG03UVZ1QWRIU1VTT0hrSzcyMFhYaFV4U1VpQXpWR1NBSUNzbTk0aUpBbVA0SGIwQUIvRjZrYk5rUHkzUXBRSUgzOHA0cGZBUmtiZkpTQm9Nd21sR2k5NTdZQnppS0hUZmZVanZ5K0dIRUN3d255YjNIZTZqeEZZU0I3OFhoTGRoU25zQUdhQkkzUldsRFplU0Y3cWQ5MnRwZXJaM0cyZmNxeFNlY3h1WEZmaVFKUVMrbHNQajEzTjNoK056T01sa3VNdHdhZGZLS2V6R1NkS3NuSkV0UTRXTW9BK1VIeE0wZz0iLCJtYWMiOiIwYjc0NThkNWQwNGNiZTViZjAyMTg3MWMwNjVkMjdhNWI1NGQzZTY5OTAzODk2NWNjZDA0ODQ5ZDgwNzRiZTI4IiwidGFnIjoiIn0%3D; _ga_7KP7V1FZW3=GS2.1.s1775322699$o7$g1$t1775323243$j60$l0$h0; laravel_session=eyJpdiI6IkNQc2xUVDI3aFhEWkdEelVlTzEyQ3c9PSIsInZhbHVlIjoicFUzb2o4K1ZOY2Z4S2Ivbit5a0xleVdsa2MwSStybEIzRmY2alZSTjB5L1Q4Qm5uYkhFeVVzbHJoZEl0ZlZqejAxTTNjbkxNYmJIc1FIQnZtSThxbGt3K2pXb3dCT21uTm9NcGlvQW1xd0hjUmVsM1BnRnp1RXlqaEE3RXp6K1EiLCJtYWMiOiJlMDc5ZjZlYmI2M2FjZDdkM2I3MmM1YmEyYTNkYTY4OTE3YTdiYjQ5MDY1ZTc5ZTJmZTdjOThlYzViMWVjNTdhIiwidGFnIjoiIn0%3D"
  };

  try {
    const response = await axios.post("https://aplicativo.rastremix.com.br/admin/clients", mirrorPayload.toString(), {
      headers: headers
    });
    console.log(`STATUS: ${response.status}`);
    console.log('BODY:', response.data);
  } catch (error) {
    console.error('ERROR:', error.response?.status, error.response?.data || error.message);
  }
}

syncCaio();
